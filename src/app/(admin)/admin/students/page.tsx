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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Students</h1>
        <form>
          <Input name="q" defaultValue={q} placeholder="Search name or email…" />
        </form>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(students ?? []).map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Link href={`/admin/students/${s.id}`} className="underline">
                  {s.full_name ?? "—"}
                </Link>
              </TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>{s.district ?? "—"}</TableCell>
              <TableCell>
                {s.is_banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
