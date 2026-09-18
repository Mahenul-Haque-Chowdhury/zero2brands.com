import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Store requests" };

export default async function AdminStoreRequestsPage() {
  const { supabase } = await requireAdmin();
  const { data: requests } = await supabase
    .from("store_requests")
    .select("id, full_name, phone, business_name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Store requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(requests ?? []).map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.full_name}</TableCell>
              <TableCell>{r.business_name ?? "—"}</TableCell>
              <TableCell>{r.phone}</TableCell>
              <TableCell>
                <Badge variant="secondary">{r.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
