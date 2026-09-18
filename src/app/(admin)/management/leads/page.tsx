import { requireAdmin } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  const { supabase } = await requireAdmin();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, full_name, phone, email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = leads ?? [];

  return (
    <div>
      <PageHeading
        title="Leads"
        description="Latest 100 leads captured across marketing forms."
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Source</Th>
              <Th>Date</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="max-w-48 truncate" title={l.full_name ?? undefined}>
                  {l.full_name ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">{l.phone ?? "-"}</TableCell>
                <TableCell className="text-muted-foreground">{l.source ?? "-"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon={UserPlus}
                    title="No leads yet"
                    hint="Marketing form submissions will collect here."
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
