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
import { Users2 } from "lucide-react";

export const metadata = { title: "Batches" };

function statusBadge(status: string) {
  if (status === "active" || status === "in_progress") {
    return (
      <Badge className="border-accent/20 bg-accent/10 text-accent capitalize" variant="outline">
        {status.replace("_", " ")}
      </Badge>
    );
  }
  if (status === "completed" || status === "closed") {
    return (
      <Badge variant="secondary" className="capitalize">
        {status}
      </Badge>
    );
  }
  if (status === "cancelled") {
    return (
      <Badge variant="destructive" className="capitalize">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="capitalize text-muted-foreground">
      {status}
    </Badge>
  );
}

export default async function AdminBatchesPage() {
  const { supabase } = await requireAdmin();
  const { data: batches } = await supabase
    .from("batches")
    .select("id, title, status, seats_taken, seat_limit, starts_at")
    .order("starts_at", { ascending: false });

  const rows = batches ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Batches</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} batch{rows.length === 1 ? "" : "es"} total.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Seats
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Starts
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Link
                    href={`/management/batches/${b.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {b.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {b.seats_taken}/{b.seat_limit}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(b.starts_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{statusBadge(b.status)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Users2 className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No batches yet</p>
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
