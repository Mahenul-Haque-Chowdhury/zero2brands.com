import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/guards";
import { CourseSidebar } from "@/components/dashboard/course-sidebar";

export const metadata = { title: "Course" };

export default async function CoursePage() {
  const { user, supabase } = await requireOnboarded();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, sequential_unlock")
    .eq("is_primary", true)
    .maybeSingle();

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
        No course is available yet.
      </div>
    );
  }

  const { data: hasAccess } = await supabase.rpc("has_course_access", {
    uid: user.id,
    cid: course.id,
  });

  if (!hasAccess) {
    redirect("/course");
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order, lessons(id, slug, title, type, duration_seconds, sort_order, global_order, is_published)")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id)
    .eq("course_id", course.id);

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id)
  );

  const firstLesson = modules?.[0]?.lessons?.[0];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row">
      <CourseSidebar
        modules={modules ?? []}
        completedLessonIds={completedLessonIds}
      />
      <div className="flex-1">
        <h1 className="mb-4 text-2xl font-semibold">{course.title}</h1>
        <p className="text-muted-foreground">
          Select a lesson from the sidebar to begin.
        </p>
        {firstLesson ? (
          <Link
            href={`/dashboard/course/${firstLesson.slug}`}
            className="mt-4 inline-block underline"
          >
            Start with &quot;{firstLesson.title}&quot;
          </Link>
        ) : null}
      </div>
    </div>
  );
}
