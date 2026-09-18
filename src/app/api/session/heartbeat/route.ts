import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  registerSession,
  heartbeatSession,
  buildDeviceFingerprint,
} from "@/lib/auth/sessions";

const bodySchema = z.object({
  sessionToken: z.string().min(10),
  register: z.boolean().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  timezone: z.string().optional(),
});

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
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (parsed.data.register) {
    const fingerprint = buildDeviceFingerprint({
      userAgent,
      screenWidth: parsed.data.screenWidth,
      screenHeight: parsed.data.screenHeight,
      timezone: parsed.data.timezone,
    });

    await registerSession({
      userId: user.id,
      sessionToken: parsed.data.sessionToken,
      deviceFingerprint: fingerprint,
      userAgent,
      ipAddress,
    });

    return NextResponse.json({ revoked: false });
  }

  const result = await heartbeatSession({
    sessionToken: parsed.data.sessionToken,
  });

  return NextResponse.json(result);
}
