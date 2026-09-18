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
import { Store } from "lucide-react";

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
    .select("id, full_name, phone, business_name, status, created_at")
    .order("created_at", { ascending: false });

  const rows = requests ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Store requests</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} request{rows.length === 1 ? "" : "s"} submitted.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Business
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
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
                <TableCell className="text-muted-foreground">{r.phone}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Store className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No store requests yet</p>
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
