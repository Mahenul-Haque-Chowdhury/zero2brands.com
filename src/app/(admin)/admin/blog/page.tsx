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

export const metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const { supabase } = await requireAdmin();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, is_published, published_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Blog</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(posts ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.title}</TableCell>
              <TableCell>
                <Badge variant={p.is_published ? "default" : "secondary"}>
                  {p.is_published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
