import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order, lessons(id, title, is_published, duration_seconds, sort_order)")
    .eq("course_id", id)
    .order("sort_order");

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="font-sans text-xl font-semibold">{course.title}</h1>
        <Badge
          variant="outline"
          className={
            course.is_published
              ? "border-accent/20 bg-accent/10 text-accent"
              : "text-muted-foreground"
          }
        >
          {course.is_published ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {(modules ?? []).map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-sans text-sm font-semibold">{m.title}</h2>
            <ul className="flex flex-col divide-y divide-border text-sm">
              {m.lessons
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                    <span className="truncate">{l.title}</span>
                    <Badge
                      variant="outline"
                      className={
                        l.is_published
                          ? "shrink-0 border-accent/20 bg-accent/10 text-accent"
                          : "shrink-0 text-muted-foreground"
                      }
                    >
                      {l.is_published ? "Published" : "Draft"}
                    </Badge>
                  </li>
                ))}
              {m.lessons.length === 0 && (
                <li className="py-2 text-sm text-muted-foreground">No lessons in this module.</li>
              )}
            </ul>
          </div>
        ))}
        {(!modules || modules.length === 0) && (
          <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No modules yet.
          </div>
        )}
      </div>
    </div>
  );
}
