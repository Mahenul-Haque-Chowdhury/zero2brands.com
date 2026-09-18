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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{student.full_name}</h1>
          <p className="text-sm text-muted-foreground">{student.email} · {student.phone}</p>
        </div>
        {student.is_banned ? (
          <form action={unbanStudentAction}>
            <input type="hidden" name="studentId" value={student.id} />
            <Button type="submit" variant="outline">Unban</Button>
          </form>
        ) : (
          <form action={banStudentAction} className="flex items-center gap-2">
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="reason" value="admin_action" />
            <Button type="submit" variant="destructive">Ban</Button>
          </form>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Course enrollments</CardTitle></CardHeader>
          <CardContent>
            {(enrollments ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-1 text-sm">
                <span>{e.courses?.title}</span>
                <Badge variant={e.status === "active" ? "default" : "destructive"}>
                  {e.status} · {e.progress_percent}%
                </Badge>
              </div>
            ))}
            {(!enrollments || enrollments.length === 0) && (
              <p className="text-sm text-muted-foreground">No enrollments.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Batch enrollments</CardTitle></CardHeader>
          <CardContent>
            {(batchEnrollments ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-1 text-sm">
                <span>{e.batches?.title}</span>
                <Badge variant={e.status === "active" ? "default" : "destructive"}>
                  {e.status}
                </Badge>
              </div>
            ))}
            {(!batchEnrollments || batchEnrollments.length === 0) && (
              <p className="text-sm text-muted-foreground">No batch enrollments.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent>
            {(payments ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1 text-xs">
                <span className="font-mono">{p.merchant_invoice_number}</span>
                <span>৳{p.amount_bdt.toLocaleString()} · {p.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active devices</CardTitle>
            <form action={signOutAllDevicesAction}>
              <input type="hidden" name="studentId" value={student.id} />
              <Button type="submit" size="sm" variant="outline">
                Sign out all
              </Button>
            </form>
          </CardHeader>
          <CardContent>
            {(sessions ?? []).map((s) => (
              <div key={s.id} className="py-1 text-xs text-muted-foreground">
                {s.user_agent?.slice(0, 50)} · last active{" "}
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
