import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/guards";
import { JoinSessionButton } from "@/components/dashboard/join-session-button";
import { PrivateLinksPanel } from "@/components/dashboard/private-links-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, supabase } = await requireOnboarded();

  const { data: batch } = await supabase
    .from("batches")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!batch) notFound();

  const { data: hasAccess } = await supabase.rpc("has_batch_access", {
    uid: user.id,
    bid: batch.id,
  });

  if (!hasAccess) notFound();

  const { data: sessions } = await supabase
    .from("live_sessions")
    .select("*")
    .eq("batch_id", batch.id)
    .eq("is_cancelled", false)
    .order("scheduled_at");

  // batch_members view: gated on has_batch_access in its own WHERE clause.
  const { data: members } = await supabase
    .from("batch_members")
    .select("*")
    .eq("batch_id", batch.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{batch.title}</h1>
        <p className="text-muted-foreground">{batch.schedule_note}</p>
      </div>

      <PrivateLinksPanel batchId={batch.id} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Sessions</h2>
        <div className="flex flex-col gap-3">
          {(sessions ?? []).map((session) => (
            <Card key={session.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">{session.title}</CardTitle>
                <JoinSessionButton liveSessionId={session.id} />
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {new Date(session.scheduled_at).toLocaleString("en-US", {
                  timeZone: "Asia/Dhaka",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                (Dhaka time)
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Batch-mates</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(members ?? []).map((m) => (
            <div key={m.user_id} className="flex flex-col items-center gap-1 text-center">
              <Avatar>
                <AvatarImage src={m.avatar_url ?? undefined} />
                <AvatarFallback>{m.full_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <p className="truncate text-xs">{m.full_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
