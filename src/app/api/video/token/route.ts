import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSignedEmbedUrl } from "@/lib/bunny/token";
import { isSessionLive } from "@/lib/auth/sessions";
import { checkRateLimit, limiters } from "@/lib/ratelimit/index";

const bodySchema = z.object({
  lessonId: z.string().uuid(),
  sessionToken: z.string().min(10),
});

/**
 * Issues a short-lived (3h) signed Bunny video token. Never generate
 * tokens client-side and never return a permanent URL — see Phase 5.2 of
 * the build plan.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const rl = await checkRateLimit(limiters.videoTokenPerUser, user.id);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const admin = createAdminClient();

  const { data: lesson } = await admin
    .from("lessons")
    .select("id, bunny_video_id, is_published, type")
    .eq("id", parsed.data.lessonId)
    .maybeSingle();

  if (!lesson || !lesson.is_published || lesson.type !== "video" || !lesson.bunny_video_id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data: canAccess } = await admin.rpc("can_access_lesson", {
    uid: user.id,
    lid: lesson.id,
  });

  if (!canAccess) {
    await admin.from("video_access_log").insert({
      user_id: user.id,
      lesson_id: lesson.id,
      bunny_video_id: lesson.bunny_video_id,
      ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: request.headers.get("user-agent"),
    });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const sessionLive = await isSessionLive(parsed.data.sessionToken);
  if (!sessionLive) {
    return NextResponse.json(
      { error: "session_expired", message: "Please sign in again." },
      { status: 401 }
    );
  }

  const { url, expiresAt } = buildSignedEmbedUrl(lesson.bunny_video_id);

  await admin.from("video_access_log").insert({
    user_id: user.id,
    lesson_id: lesson.id,
    bunny_video_id: lesson.bunny_video_id,
    ip_address:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ url, expiresAt });
}
