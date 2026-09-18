import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { minutesAgo } from "@/lib/utils/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin();

  const tenMinutesAgo = minutesAgo(10).toISOString();

  const { data: stuckPayments } = await supabase
    .from("payments")
    .select("id, merchant_invoice_number, amount_bdt, created_at")
    .eq("status", "processing")
    .lt("created_at", tenMinutesAgo)
    .order("created_at", { ascending: true });

  const { data: moderationReports } = await supabase
    .from("reports")
    .select("id, reason, status, created_at, reporter_id, reported_user_id")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Payment reconciliation and moderation, at a glance.
          </p>
        </div>
        <Link
          href="/admin/reports/watchlist"
          className="text-sm font-medium text-primary hover:underline"
        >
          Abuse watchlist
        </Link>
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="font-sans text-sm">
            Reconciliation, payments stuck processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stuckPayments && stuckPayments.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Invoice
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stuckPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.merchant_invoice_number}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        &#2547;{p.amount_bdt.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-accent" />
              None right now. The reconciliation cron runs every 15 minutes.
            </div>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="font-sans text-sm">Moderation queue</CardTitle>
        </CardHeader>
        <CardContent>
          {moderationReports && moderationReports.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Reason
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Reported
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationReports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <ShieldAlert className="size-4 text-muted-foreground/50" />
              No open reports.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
