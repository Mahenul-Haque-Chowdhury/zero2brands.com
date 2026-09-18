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

export const metadata = { title: "Lessons" };

export default async function AdminLessonsPage() {
  const { supabase } = await requireAdmin();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, type, bunny_video_id, is_published, duration_seconds")
    .order("global_order");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Lessons</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Video uploads use the TUS resumable flow (api/admin/videos/create-upload)
        directly to Bunny. A lesson cannot publish until encoding finishes.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(lessons ?? []).map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.title}</TableCell>
              <TableCell>{l.type}</TableCell>
              <TableCell>
                {l.duration_seconds ? `${Math.round(l.duration_seconds / 60)} min` : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={l.is_published ? "default" : "secondary"}>
                  {l.is_published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
