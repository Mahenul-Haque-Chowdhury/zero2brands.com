import { requireStaff } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ManualPaymentDialog } from "./manual-payment-dialog";

export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const { profile, supabase } = await requireStaff();

  // Payments touch money: instructors don't get this page.
  if (profile?.role === "instructor") {
    return <p className="text-muted-foreground">Not authorized.</p>;
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("id, merchant_invoice_number, amount_bdt, status, gateway, created_at, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <ManualPaymentDialog />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(payments ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">
                  {p.merchant_invoice_number}
                </TableCell>
                <TableCell>{p.profiles?.full_name ?? p.profiles?.email}</TableCell>
                <TableCell>৳{p.amount_bdt.toLocaleString()}</TableCell>
                <TableCell>{p.gateway}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.status === "completed"
                        ? "default"
                        : p.status === "processing"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
