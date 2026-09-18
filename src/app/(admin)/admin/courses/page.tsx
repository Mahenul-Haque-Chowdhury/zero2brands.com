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

export const metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const { supabase } = await requireAdmin();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, price_bdt, is_published, total_lessons, sort_order")
    .order("sort_order");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Courses</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Lessons</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(courses ?? []).map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={`/admin/courses/${c.id}`} className="underline">
                  {c.title}
                </Link>
              </TableCell>
              <TableCell>৳{c.price_bdt.toLocaleString()}</TableCell>
              <TableCell>{c.total_lessons}</TableCell>
              <TableCell>
                <Badge variant={c.is_published ? "default" : "secondary"}>
                  {c.is_published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
