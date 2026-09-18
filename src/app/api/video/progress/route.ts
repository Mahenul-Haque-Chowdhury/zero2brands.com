import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
  watchedSeconds: z.number().min(0).max(24 * 60 * 60),
  lastPositionSeconds: z.number().min(0),
  durationSeconds: z.number().min(0).optional(),
  ended: z.boolean().optional(),
});

// A student cannot plausibly report more watched-seconds progress than
// this many seconds of real elapsed wall-clock time since their last
// update, plus generous margin for seeking/buffering. Stops a student from
// posting watched_seconds: 99999 to instantly complete a lesson (and, with
// sequential unlocking, skip the whole course).
const MAX_PLAUSIBLE_DELTA_MULTIPLIER = 3;
const MIN_UPDATE_INTERVAL_SECONDS = 5;

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

  const { lessonId, courseId, watchedSeconds, lastPositionSeconds, ended } =
    parsed.data;

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("watched_seconds, first_viewed_at, last_viewed_at, is_completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const now = new Date();
  let plausibleWatchedSeconds = watchedSeconds;

  if (existing?.last_viewed_at) {
    const elapsedSeconds =
      (now.getTime() - new Date(existing.last_viewed_at).getTime()) / 1000;
    const maxPlausibleIncrease = Math.max(
      elapsedSeconds * MAX_PLAUSIBLE_DELTA_MULTIPLIER,
      MIN_UPDATE_INTERVAL_SECONDS
    );
    const proposedIncrease = watchedSeconds - existing.watched_seconds;

    if (proposedIncrease > maxPlausibleIncrease) {
      plausibleWatchedSeconds =
        existing.watched_seconds + maxPlausibleIncrease;
    }
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("duration_seconds")
    .eq("id", lessonId)
    .maybeSingle();

  const durationSeconds = lesson?.duration_seconds ?? parsed.data.durationSeconds ?? 0;
  const completionThreshold = durationSeconds * 0.9;
  const isCompleted =
    existing?.is_completed ||
    ended === true ||
    (durationSeconds > 0 && plausibleWatchedSeconds >= completionThreshold);

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      watched_seconds: Math.round(plausibleWatchedSeconds),
      last_position_seconds: Math.round(lastPositionSeconds),
      is_completed: isCompleted,
      completed_at: isCompleted
        ? existing?.is_completed
          ? undefined
          : now.toISOString()
        : null,
      first_viewed_at: existing?.first_viewed_at ?? now.toISOString(),
      last_viewed_at: now.toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: "could not save progress" }, { status: 500 });
  }

  return NextResponse.json({ isCompleted });
}
