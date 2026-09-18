import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

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
      <PageHeading
        title="Students"
        description={`${rows.length} shown, most recently joined first.`}
        action={
          <form className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search name or email..."
              className="pl-8"
            />
          </form>
        }
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>District</Th>
              <Th>Status</Th>
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
                  <EmptyState
                    icon={Users}
                    title="No students found"
                    hint={
                      q
                        ? "Try a different search."
                        : "Students will appear here once they sign up."
                    }
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
