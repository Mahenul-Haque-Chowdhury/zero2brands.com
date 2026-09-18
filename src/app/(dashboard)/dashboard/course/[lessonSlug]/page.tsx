import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Lock } from "lucide-react";
import { requireOnboarded } from "@/lib/auth/guards";
import { CourseSidebar } from "@/components/dashboard/course-sidebar";
import { VideoPlayer } from "@/components/video/video-player";
import { LessonNotes } from "@/components/dashboard/lesson-notes";
import { MarkCompleteButton } from "@/components/dashboard/mark-complete-button";
import { Badge } from "@/components/ui/badge";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const { user, profile, supabase } = await requireOnboarded();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules(course_id)")
    .eq("slug", lessonSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (!lesson) {
    notFound();
  }

  const { data: canAccess } = await supabase.rpc("can_access_lesson", {
    uid: user.id,
    lid: lesson.id,
  });

  if (!canAccess) {
    // Either no course access at all, or sequential unlock blocks this one.
    const { data: hasCourseAccess } = await supabase.rpc("has_course_access", {
      uid: user.id,
      cid: lesson.course_id,
    });

    if (!hasCourseAccess) {
      redirect("/course");
    }

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
          <Lock className="size-6" />
        </span>
        <h1 className="mt-1 text-xl font-semibold">This lesson is locked</h1>
        <p className="max-w-sm text-muted-foreground">
          Lessons unlock in order. Finish the ones before this to open it.
        </p>
        <Link
          href="/dashboard/course"
          className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
        >
          <ChevronLeft className="size-4" />
          Back to course
        </Link>
      </div>
    );
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order, lessons(id, slug, title, type, duration_seconds, sort_order, global_order, is_published)")
    .eq("course_id", lesson.course_id)
    .eq("is_published", true)
    .order("sort_order");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id)
    .eq("course_id", lesson.course_id);

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id)
  );

  const { data: note } = await supabase
    .from("lesson_notes")
    .select("content")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  const { data: resources } = await supabase
    .from("lesson_resources")
    .select("id, title, storage_path, file_size_bytes")
    .eq("lesson_id", lesson.id)
    .order("sort_order");

  const allLessonsFlat = (modules ?? [])
    .flatMap((m) => m.lessons)
    .filter((l) => l.is_published)
    .sort((a, b) => (a.global_order ?? 0) - (b.global_order ?? 0));
  const currentIndex = allLessonsFlat.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessonsFlat[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessonsFlat.length - 1
      ? allLessonsFlat[currentIndex + 1]
      : null;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <CourseSidebar
        modules={modules ?? []}
        completedLessonIds={completedLessonIds}
        activeLessonSlug={lessonSlug}
      />
      <div className="flex-1 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{lesson.title}</h1>
          <Badge variant="outline" className="capitalize">
            {lesson.type}
          </Badge>
        </div>

        {lesson.type === "video" && lesson.bunny_video_id ? (
          <VideoPlayer
            lessonId={lesson.id}
            courseId={lesson.course_id}
            watermarkLabel={profile?.phone ?? profile?.email ?? user.email ?? ""}
          />
        ) : null}

        {lesson.type === "text" && lesson.content_html ? (
          <div
            className="prose max-w-none"
            // content_html is sanitized server-side on write (admin lesson
            // editor), never here on render — see lib/utils/sanitize.ts.
            dangerouslySetInnerHTML={{ __html: lesson.content_html }}
          />
        ) : null}

        {lesson.description ? (
          <p className="mt-4 text-sm text-muted-foreground">{lesson.description}</p>
        )
        : null}

        {resources && resources.length > 0 ? (
          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <h2 className="mb-2 text-sm font-semibold">Resources</h2>
            <ul className="flex flex-col gap-1.5">
              {resources.map((r) => (
                <li key={r.id}>
                  <a
                    href={`/dashboard/resources?download=${r.id}`}
                    className="group inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 transition-colors duration-200 hover:underline"
                  >
                    <FileText className="size-3.5 transition-colors duration-200 group-hover:text-accent" />
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <div className="flex gap-4">
            {prevLesson ? (
              <Link
                href={`/dashboard/course/${prevLesson.slug}`}
                className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Previous
              </Link>
            ) : null}
            {nextLesson ? (
              <Link
                href={`/dashboard/course/${nextLesson.slug}`}
                className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Next
                <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </div>
          <MarkCompleteButton
            lessonId={lesson.id}
            courseId={lesson.course_id}
            initiallyCompleted={completedLessonIds.has(lesson.id)}
          />
        </div>

        <LessonNotes lessonId={lesson.id} initialContent={note?.content ?? ""} />
      </div>
    </div>
  );
}
