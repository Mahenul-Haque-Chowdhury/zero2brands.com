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
import { Newspaper } from "lucide-react";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const { supabase } = await requireAdmin();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, is_published, published_at")
    .order("created_at", { ascending: false });

  const rows = posts ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} post{rows.length === 1 ? "" : "s"} in the CMS.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-96 truncate" title={p.title}>
                  {p.title}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      p.is_published
                        ? "border-accent/20 bg-accent/10 text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {p.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="p-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Newspaper className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No posts yet</p>
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
