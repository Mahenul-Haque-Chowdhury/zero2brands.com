import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/guards";
import { CourseSidebar } from "@/components/dashboard/course-sidebar";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BookOpen className="size-6" />
        </span>
        <p className="font-medium">No course is available yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check back soon, your course will appear here once it is published.
        </p>
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
    <div className="flex flex-col gap-6 md:flex-row">
      <CourseSidebar
        modules={modules ?? []}
        completedLessonIds={completedLessonIds}
      />
      <div className="flex-1 rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
        <p className="mt-2 text-muted-foreground">
          Select a lesson from the sidebar to begin.
        </p>
        {firstLesson ? (
          <Button className="mt-5" render={<Link href={`/dashboard/course/${firstLesson.slug}`} />}>
            <PlayCircle className="size-4" />
            Start with &quot;{firstLesson.title}&quot;
          </Button>
        ) : null}
      </div>
    </div>
  );
}
