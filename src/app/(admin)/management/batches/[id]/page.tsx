import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: batch } = await supabase
    .from("batches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!batch) notFound();

  const { data: sessions } = await supabase
    .from("live_sessions")
    .select("id, title, scheduled_at, is_cancelled")
    .eq("batch_id", id)
    .order("scheduled_at");

  const { data: enrollments } = await supabase
    .from("batch_enrollments")
    .select("id, status, profiles:user_id(full_name, email)")
    .eq("batch_id", id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-sans text-xl font-semibold tracking-tight">
          {batch.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {batch.seats_taken}/{batch.seat_limit}
          </span>{" "}
          seats &middot; <span className="capitalize">{batch.status}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-sans text-sm">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {(sessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
                <span className="truncate">{s.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(s.scheduled_at).toLocaleString()}
                  {s.is_cancelled ? " (cancelled)" : ""}
                </span>
              </div>
            ))}
            {(!sessions || sessions.length === 0) && (
              <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-sans text-sm">Enrolled students</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {(enrollments ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
                <span className="truncate">{e.profiles?.full_name ?? e.profiles?.email}</span>
                <Badge
                  variant="outline"
                  className={
                    e.status === "active"
                      ? "shrink-0 border-accent/20 bg-accent/10 text-accent"
                      : "shrink-0 border-destructive/20 bg-destructive/10 text-destructive"
                  }
                >
                  {e.status}
                </Badge>
              </div>
            ))}
            {(!enrollments || enrollments.length === 0) && (
              <p className="text-sm text-muted-foreground">No students enrolled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
