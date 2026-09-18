import Link from "next/link";
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

export const metadata = { title: "Batches" };

export default async function AdminBatchesPage() {
  const { supabase } = await requireAdmin();
  const { data: batches } = await supabase
    .from("batches")
    .select("id, title, status, seats_taken, seat_limit, starts_at")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Batches</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(batches ?? []).map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Link href={`/admin/batches/${b.id}`} className="underline">
                  {b.title}
                </Link>
              </TableCell>
              <TableCell>{b.seats_taken}/{b.seat_limit}</TableCell>
              <TableCell>{new Date(b.starts_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="secondary">{b.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
