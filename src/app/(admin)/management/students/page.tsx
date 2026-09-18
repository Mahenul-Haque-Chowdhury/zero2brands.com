import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";

export const metadata = { title: "Students" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { supabase } = await requireStaff();
  const { q } = await searchParams;

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, district, is_banned, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: students } = await query;
  const rows = students ?? [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} shown, most recently joined first.
          </p>
        </div>
        <form className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search name or email..."
            className="pl-8"
          />
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                District
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link
                    href={`/management/students/${s.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {s.full_name ?? "Unnamed"}
                  </Link>
                </TableCell>
                <TableCell className="max-w-56 truncate text-muted-foreground" title={s.email ?? undefined}>
                  {s.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.district ?? "-"}
                </TableCell>
                <TableCell>
                  {s.is_banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge className="border-accent/20 bg-accent/10 text-accent" variant="outline">
                      Active
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Users className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs text-muted-foreground">
                      {q ? "Try a different search." : "Students will appear here once they sign up."}
                    </p>
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
