import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

export const metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const { supabase } = await requireAdmin();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, price_bdt, is_published, total_lessons, sort_order")
    .order("sort_order");

  const rows = courses ?? [];

  return (
    <div>
      <PageHeading
        title="Courses"
        description={`${rows.length} course${rows.length === 1 ? "" : "s"} in the catalog.`}
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Title</Th>
              <Th align="right">Price</Th>
              <Th align="right">Lessons</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/management/courses/${c.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {c.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  &#2547;{c.price_bdt.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {c.total_lessons}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      c.is_published
                        ? "border-accent/20 bg-accent/10 text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {c.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon={BookOpen}
                    title="No courses yet"
                    hint="Published courses will be listed here."
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
