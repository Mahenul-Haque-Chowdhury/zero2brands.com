import { requireAdmin } from "@/lib/auth/guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";

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
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Latest 100 leads captured across marketing forms.
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
                Phone
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Source
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Date
              </TableHead>
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
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <UserPlus className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No leads yet</p>
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
