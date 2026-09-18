import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{batch.title}</h1>
        <p className="text-sm text-muted-foreground">
          {batch.seats_taken}/{batch.seat_limit} seats · {batch.status}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Sessions</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {(sessions ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between">
              <span>{s.title}</span>
              <span className="text-muted-foreground">
                {new Date(s.scheduled_at).toLocaleString()}
                {s.is_cancelled ? " (cancelled)" : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Enrolled students</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {(enrollments ?? []).map((e) => (
            <li key={e.id} className="flex items-center justify-between">
              <span>{e.profiles?.full_name ?? e.profiles?.email}</span>
              <Badge variant={e.status === "active" ? "default" : "destructive"}>
                {e.status}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
