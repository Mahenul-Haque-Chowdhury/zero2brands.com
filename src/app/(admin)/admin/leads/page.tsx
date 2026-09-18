import { requireAdmin } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  const { supabase } = await requireAdmin();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, full_name, phone, email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Leads</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(leads ?? []).map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.full_name ?? "—"}</TableCell>
              <TableCell>{l.phone ?? "—"}</TableCell>
              <TableCell>{l.source ?? "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(l.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
