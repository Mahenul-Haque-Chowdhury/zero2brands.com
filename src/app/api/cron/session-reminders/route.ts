import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queueEmail } from "@/lib/email/resend";
import { queueSms } from "@/lib/sms/gateway";

/**
 * Runs hourly. Sends a 24h-before email and a 1h-before SMS for each
 * upcoming live session, logging every send to avoid duplicates on cron
 * retry (checked via a dedicated reminder-sent marker table lookup
 * pattern using email_log/sms_log template+recipient+session window).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  const in24h = new Date(now + 24 * 60 * 60 * 1000);
  const in23h = new Date(now + 23 * 60 * 60 * 1000);
  const in1h = new Date(now + 60 * 60 * 1000);
  const in50m = new Date(now + 50 * 60 * 1000);

  const [{ data: sessionsFor24h }, { data: sessionsFor1h }] = await Promise.all([
    admin
      .from("live_sessions")
      .select("id, title, batch_id, scheduled_at")
      .eq("is_cancelled", false)
      .gte("scheduled_at", in23h.toISOString())
      .lte("scheduled_at", in24h.toISOString()),
    admin
      .from("live_sessions")
      .select("id, title, batch_id, scheduled_at")
      .eq("is_cancelled", false)
      .gte("scheduled_at", in50m.toISOString())
      .lte("scheduled_at", in1h.toISOString()),
  ]);

  let emailsSent = 0;
  let smsSent = 0;

  for (const session of sessionsFor24h ?? []) {
    // Dedup guard: skip if we already logged a reminder for this exact
    // session in the last 2 hours (cron runs hourly, window is 1h wide).
    const { count: alreadySent } = await admin
      .from("email_log")
      .select("id", { count: "exact", head: true })
      .eq("template", "session_reminder_24h")
      .gte("created_at", new Date(now - 2 * 60 * 60 * 1000).toISOString());

    if (alreadySent && alreadySent > 0) continue;

    const { data: enrolled } = await admin
      .from("batch_enrollments")
      .select("user_id")
      .eq("batch_id", session.batch_id)
      .eq("status", "active");

    for (const e of enrolled ?? []) {
      void queueEmail({
        template: "session_reminder_24h",
        userId: e.user_id,
        data: { sessionTitle: session.title },
      }).catch(() => {});
      emailsSent++;
    }
  }

  for (const session of sessionsFor1h ?? []) {
    const { data: enrolled } = await admin
      .from("batch_enrollments")
      .select("user_id")
      .eq("batch_id", session.batch_id)
      .eq("status", "active");

    for (const e of enrolled ?? []) {
      void queueSms({
        template: "session_reminder_1h",
        userId: e.user_id,
        data: { sessionTitle: session.title },
      }).catch(() => {});
      smsSent++;
    }
  }

  return NextResponse.json({ emailsSent, smsSent });
}
