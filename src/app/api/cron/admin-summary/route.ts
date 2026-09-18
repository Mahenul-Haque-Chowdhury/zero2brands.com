import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queueEmail } from "@/lib/email/resend";

/**
 * Weekly admin summary email with revenue and enrollment numbers
 * (Phase 17). Sent to every admin/superadmin profile.
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
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: payments }, { count: newEnrollments }, { count: newBatchEnrollments }, { data: admins }] =
    await Promise.all([
      admin
        .from("payments")
        .select("amount_bdt")
        .eq("status", "completed")
        .gte("paid_at", weekAgo),
      admin
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .gte("granted_at", weekAgo),
      admin
        .from("batch_enrollments")
        .select("id", { count: "exact", head: true })
        .gte("granted_at", weekAgo),
      admin.from("profiles").select("id, email").in("role", ["admin", "superadmin"]),
    ]);

  const revenue = (payments ?? []).reduce((acc, p) => acc + p.amount_bdt, 0);

  for (const adminProfile of admins ?? []) {
    void queueEmail({
      template: "admin_weekly_summary",
      to: adminProfile.email,
      data: {
        revenue,
        newEnrollments: newEnrollments ?? 0,
        newBatchEnrollments: newBatchEnrollments ?? 0,
      },
    }).catch(() => {});
  }

  return NextResponse.json({
    revenue,
    newEnrollments: newEnrollments ?? 0,
    newBatchEnrollments: newBatchEnrollments ?? 0,
    recipientCount: admins?.length ?? 0,
  });
}
