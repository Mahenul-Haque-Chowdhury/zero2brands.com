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
import { BookOpen } from "lucide-react";

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
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Courses</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} course{rows.length === 1 ? "" : "s"} in the catalog.
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
                Price
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Lessons
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
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
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <BookOpen className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No courses yet</p>
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
