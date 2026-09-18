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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <Link href="/admin/reports/watchlist" className="text-sm underline">
          Abuse watchlist
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation — payments stuck processing</CardTitle>
        </CardHeader>
        <CardContent>
          {stuckPayments && stuckPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stuckPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {p.merchant_invoice_number}
                    </TableCell>
                    <TableCell>৳{p.amount_bdt.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              None right now. The reconciliation cron runs every 15 minutes.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moderation queue</CardTitle>
        </CardHeader>
        <CardContent>
          {moderationReports && moderationReports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported</TableHead>
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
          ) : (
            <p className="text-sm text-muted-foreground">No open reports.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
