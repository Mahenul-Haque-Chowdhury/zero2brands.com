import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

export const metadata = { title: "Store requests" };

function statusBadge(status: string) {
  if (status === "approved" || status === "completed") {
    return (
      <Badge className="border-accent/20 bg-accent/10 text-accent capitalize" variant="outline">
        {status}
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="capitalize">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="capitalize">
      {status}
    </Badge>
  );
}

export default async function AdminStoreRequestsPage() {
  const { supabase } = await requireAdmin();
  const { data: requests } = await supabase
    .from("store_requests")
    .select("id, full_name, phone, business_name, product_category, status, created_at")
    .order("created_at", { ascending: false });

  const rows = requests ?? [];

  return (
    <div>
      <PageHeading
        title="Store requests"
        description={`${rows.length} request${rows.length === 1 ? "" : "s"} submitted.`}
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Name</Th>
              <Th>Business</Th>
              <Th>Project type</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-40 truncate" title={r.full_name}>
                  {r.full_name}
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground" title={r.business_name ?? undefined}>
                  {r.business_name ?? "-"}
                </TableCell>
                <TableCell className="max-w-44 truncate text-muted-foreground" title={r.product_category ?? undefined}>
                  {r.product_category ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">{r.phone}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={Store}
                    title="No store requests yet"
                    hint="Requests from the student dashboard land here."
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
