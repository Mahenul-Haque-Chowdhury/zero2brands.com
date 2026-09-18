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
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <Badge variant={course.is_published ? "default" : "secondary"}>
          {course.is_published ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        {(modules ?? []).map((m) => (
          <div key={m.id} className="rounded-lg border p-4">
            <h2 className="mb-2 font-semibold">{m.title}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {m.lessons
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((l) => (
                  <li key={l.id} className="flex items-center justify-between">
                    <span>{l.title}</span>
                    <Badge variant={l.is_published ? "default" : "secondary"}>
                      {l.is_published ? "Published" : "Draft"}
                    </Badge>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
