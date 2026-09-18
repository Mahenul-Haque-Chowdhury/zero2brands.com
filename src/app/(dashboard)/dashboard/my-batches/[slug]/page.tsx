import { notFound } from "next/navigation";
import { Users2 } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{batch.title}</h1>
        {batch.schedule_note ? (
          <p className="mt-1 text-muted-foreground">{batch.schedule_note}</p>
        ) : null}
      </div>

      <PrivateLinksPanel batchId={batch.id} />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Sessions</h2>
        {sessions && sessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
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
        ) : (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No sessions scheduled yet.
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Batch-mates</h2>
        {members && members.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {members.map((m) => (
              <div key={m.user_id} className="flex flex-col items-center gap-1.5 text-center">
                <Avatar className="size-12">
                  <AvatarImage src={m.avatar_url ?? undefined} />
                  <AvatarFallback>{m.full_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <p className="w-full truncate text-xs">{m.full_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            <Users2 className="size-5" />
            No batch-mates yet.
          </div>
        )}
      </div>
    </div>
  );
}
