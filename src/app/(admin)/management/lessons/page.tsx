import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileVideo } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

export const metadata = { title: "Lessons" };

export default async function AdminLessonsPage() {
  const { supabase } = await requireAdmin();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, type, bunny_video_id, is_published, duration_seconds")
    .order("global_order");

  const rows = lessons ?? [];

  return (
    <div>
      <PageHeading
        title="Lessons"
        description="Video uploads use the TUS resumable flow (api/admin/videos/create-upload) directly to Bunny. A lesson cannot publish until encoding finishes."
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Title</Th>
              <Th>Type</Th>
              <Th align="right">Duration</Th>
              <Th>Status</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="max-w-72 truncate" title={l.title}>
                  {l.title}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">{l.type}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {l.duration_seconds ? `${Math.round(l.duration_seconds / 60)} min` : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      l.is_published
                        ? "border-accent/20 bg-accent/10 text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {l.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon={FileVideo}
                    title="No lessons yet"
                    hint="Lessons appear here once a module has content."
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
