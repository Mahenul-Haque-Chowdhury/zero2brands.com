import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  banStudentAction,
  unbanStudentAction,
  signOutAllDevicesAction,
} from "./actions";

function statusBadge(status: string) {
  if (status === "active") {
    return (
      <Badge className="border-accent/20 bg-accent/10 text-accent" variant="outline">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="capitalize">
      {status}
    </Badge>
  );
}

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!student) notFound();

  const [{ data: enrollments }, { data: batchEnrollments }, { data: payments }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id, status, progress_percent, courses(title)")
        .eq("user_id", id),
      supabase
        .from("batch_enrollments")
        .select("id, status, batches(title)")
        .eq("user_id", id),
      supabase
        .from("payments")
        .select("id, merchant_invoice_number, amount_bdt, status, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("active_sessions")
        .select("id, user_agent, last_heartbeat_at")
        .eq("user_id", id),
    ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-xl font-semibold">{student.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {student.email} &middot; {student.phone}
          </p>
        </div>
        {student.is_banned ? (
          <form action={unbanStudentAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <Button type="submit" variant="outline" size="sm">Unban</Button>
          </form>
        ) : (
          <form action={banStudentAction} className="flex items-center gap-2">
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="reason" value="admin_action" />
            <Button type="submit" variant="destructive" size="sm">Ban</Button>
          </form>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-sans text-sm">Course enrollments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {(enrollments ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
                <span className="truncate">{e.courses?.title}</span>
                <Badge
                  variant="outline"
                  className={
                    e.status === "active"
                      ? "border-accent/20 bg-accent/10 text-accent shrink-0"
                      : "border-destructive/20 bg-destructive/10 text-destructive shrink-0"
                  }
                >
                  {e.status} &middot; {e.progress_percent}%
                </Badge>
              </div>
            ))}
            {(!enrollments || enrollments.length === 0) && (
              <p className="text-sm text-muted-foreground">No enrollments.</p>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-sans text-sm">Batch enrollments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {(batchEnrollments ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
                <span className="truncate">{e.batches?.title}</span>
                {statusBadge(e.status)}
              </div>
            ))}
            {(!batchEnrollments || batchEnrollments.length === 0) && (
              <p className="text-sm text-muted-foreground">No batch enrollments.</p>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-sans text-sm">Payments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {(payments ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2 text-xs first:pt-0 last:pb-0">
                <span className="font-mono text-muted-foreground">{p.merchant_invoice_number}</span>
                <span className="font-medium tabular-nums">
                  &#2547;{p.amount_bdt.toLocaleString()} &middot; {p.status}
                </span>
              </div>
            ))}
            {(!payments || payments.length === 0) && (
              <p className="text-sm text-muted-foreground">No payments.</p>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-sans text-sm">Active devices</CardTitle>
            <form action={signOutAllDevicesAction}>
              <input type="hidden" name="studentId" value={student.id} />
              <Button type="submit" size="sm" variant="outline">
                Sign out all
              </Button>
            </form>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {(sessions ?? []).map((s) => (
              <div key={s.id} className="py-2 text-xs text-muted-foreground first:pt-0 last:pb-0">
                {s.user_agent?.slice(0, 50)} &middot; last active{" "}
                {new Date(s.last_heartbeat_at).toLocaleString()}
              </div>
            ))}
            {(!sessions || sessions.length === 0) && (
              <p className="text-sm text-muted-foreground">No active devices.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
