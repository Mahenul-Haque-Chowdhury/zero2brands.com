import { requireStaff } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
import { ManualPaymentDialog } from "./manual-payment-dialog";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

export const metadata = { title: "Payments" };

function statusBadge(status: string) {
  if (status === "completed") {
    return (
      <Badge className="border-accent/20 bg-accent/10 text-accent" variant="outline">
        Completed
      </Badge>
    );
  }
  if (status === "processing") {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Processing
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="capitalize">
      {status}
    </Badge>
  );
}

export default async function AdminPaymentsPage() {
  const { profile, supabase } = await requireStaff();

  // Payments touch money: instructors don't get this page.
  if (profile?.role === "instructor") {
    return <p className="text-sm text-muted-foreground">Not authorized.</p>;
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("id, merchant_invoice_number, amount_bdt, status, gateway, created_at, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = payments ?? [];

  return (
    <div>
      <PageHeading
        title="Payments"
        description="Latest 100 transactions across bKash and manual entries."
        action={<ManualPaymentDialog />}
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Invoice</Th>
              <Th>Student</Th>
              <Th align="right">Amount</Th>
              <Th>Gateway</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.merchant_invoice_number}
                </TableCell>
                <TableCell
                  className="max-w-48 truncate"
                  title={p.profiles?.full_name ?? p.profiles?.email ?? undefined}
                >
                  {p.profiles?.full_name ?? p.profiles?.email ?? "-"}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  &#2547;{p.amount_bdt.toLocaleString()}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {p.gateway}
                </TableCell>
                <TableCell>{statusBadge(p.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={Receipt}
                    title="No payments yet"
                    hint="Transactions will show up here once students start paying."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}
