import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Newspaper } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

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
      <PageHeading
        title="Blog"
        description={`${rows.length} post${rows.length === 1 ? "" : "s"} in the CMS.`}
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Title</Th>
              <Th>Status</Th>
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
                  <EmptyState
                    icon={Newspaper}
                    title="No posts yet"
                    hint="Drafts and published articles appear here."
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
