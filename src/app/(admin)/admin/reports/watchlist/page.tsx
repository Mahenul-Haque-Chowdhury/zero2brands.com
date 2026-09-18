import { requireAdmin } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Abuse watchlist" };

/**
 * Surfaces the nightly abuse-detection cron's findings (audit_log rows
 * with action = 'abuse_watchlist_flag'). Per Phase 14.6, these are flags
 * for human review, never auto-bans — false positives are common on
 * Bangladeshi mobile networks that rotate IPs aggressively.
 */
export default async function AbuseWatchlistPage() {
  const { supabase } = await requireAdmin();

  const { data: flags } = await supabase
    .from("audit_log")
    .select("id, entity_id, after, created_at")
    .eq("action", "abuse_watchlist_flag")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Abuse watchlist</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Flagged by the nightly abuse-detection job. Nothing here is
        auto-banned — review each case before taking action.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Reasons</TableHead>
            <TableHead>Flagged</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(flags ?? []).map((f) => {
            const details = f.after as {
              reasons?: string[];
              distinctIps?: number;
              distinctDevices?: number;
              tokenRequests?: number;
            } | null;
            return (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-xs">{f.entity_id}</TableCell>
                <TableCell className="text-sm">
                  {details?.reasons?.join("; ") ?? "—"}
                  <div className="text-xs text-muted-foreground">
                    {details?.distinctIps ?? 0} IPs · {details?.distinctDevices ?? 0}{" "}
                    devices · {details?.tokenRequests ?? 0} token requests
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(f.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
          {(!flags || flags.length === 0) && (
            <TableRow>
              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                Nothing flagged.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
