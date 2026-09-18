import { Laptop } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevokeDeviceButton } from "./revoke-device-button";

export const metadata = { title: "Devices" };

export default async function DevicesPage() {
  const { user, supabase } = await requireUser();

  const { data: sessions } = await supabase
    .from("active_sessions")
    .select("id, user_agent, ip_address, last_heartbeat_at, created_at")
    .eq("user_id", user.id)
    .order("last_heartbeat_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Active devices</h1>
        <p className="mt-1 text-muted-foreground">
          You can be logged in on up to two devices at once. Sign out a
          device you don&apos;t recognize.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {sessions && sessions.length > 0 ? (
          sessions.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Laptop className="size-4 text-muted-foreground" />
                  {s.user_agent?.slice(0, 60) ?? "Unknown device"}
                </CardTitle>
                <RevokeDeviceButton sessionId={s.id} />
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Last active {new Date(s.last_heartbeat_at).toLocaleString()}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No active devices found.
          </p>
        )}
      </div>
    </div>
  );
}
