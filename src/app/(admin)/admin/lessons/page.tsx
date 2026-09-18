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
import { FileVideo } from "lucide-react";

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
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Lessons</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Video uploads use the TUS resumable flow (api/admin/videos/create-upload)
          directly to Bunny. A lesson cannot publish until encoding finishes.
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
                Type
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
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
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <FileVideo className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No lessons yet</p>
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
