import { requireAdmin } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";

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

  const rows = flags ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Abuse watchlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Flagged by the nightly abuse-detection job. Nothing here is
          auto-banned, review each case before taking action.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                User ID
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Reasons
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Flagged
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((f) => {
              const details = f.after as {
                reasons?: string[];
                distinctIps?: number;
                distinctDevices?: number;
                tokenRequests?: number;
              } | null;
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {f.entity_id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {details?.reasons?.join("; ") ?? "-"}
                    <div className="text-xs text-muted-foreground">
                      {details?.distinctIps ?? 0} IPs &middot; {details?.distinctDevices ?? 0}{" "}
                      devices &middot; {details?.tokenRequests ?? 0} token requests
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(f.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="p-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <ShieldCheck className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Nothing flagged</p>
                    <p className="text-xs text-muted-foreground">
                      The nightly job has not raised anything for review.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
