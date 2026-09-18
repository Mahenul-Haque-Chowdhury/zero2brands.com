import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  type: string;
  duration_seconds: number;
  sort_order: number;
  global_order: number | null;
  is_published: boolean;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

export function CourseSidebar({
  modules,
  completedLessonIds,
  activeLessonSlug,
}: {
  modules: Module[];
  completedLessonIds: Set<string>;
  activeLessonSlug?: string;
}) {
  const allLessons = modules.flatMap((m) =>
    m.lessons.filter((l) => l.is_published)
  );
  const completedCount = allLessons.filter((l) =>
    completedLessonIds.has(l.id)
  ).length;
  const percent =
    allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;

  return (
    <aside className="w-full shrink-0 self-start rounded-xl border border-border bg-card p-3 md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:w-72 md:overflow-y-auto">
      {/* Course-wide progress, so the lesson list always answers "how far
          along am I" without a trip back to the overview. */}
      <div className="mb-4 rounded-lg bg-muted/60 px-3 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Progress
          </span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {completedCount}
            <span className="text-muted-foreground">/{allLessons.length}</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {modules.map((module, i) => {
        const moduleLessons = module.lessons.filter((l) => l.is_published);
        const moduleDone = moduleLessons.filter((l) =>
          completedLessonIds.has(l.id)
        ).length;
        const moduleComplete =
          moduleLessons.length > 0 && moduleDone === moduleLessons.length;

        return (
        <div
          key={module.id}
          className={cn("mb-4 last:mb-0", i > 0 && "border-t border-border pt-4")}
        >
          <h3 className="mb-2 flex items-center justify-between gap-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="truncate">{module.title}</span>
            <span
              className={cn(
                "shrink-0 tabular-nums transition-colors duration-200",
                moduleComplete && "text-accent"
              )}
            >
              {moduleDone}/{moduleLessons.length}
            </span>
          </h3>
          <ul className="flex flex-col gap-0.5">
            {moduleLessons
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((lesson) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isActive = lesson.slug === activeLessonSlug;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/dashboard/course/${lesson.slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                        "transition-all duration-200 ease-out hover:bg-muted",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-accent/10 font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute left-0 top-1/2 w-0.5 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-200",
                          isActive ? "h-4 opacity-100" : "h-0 opacity-0"
                        )}
                      />
                      {isCompleted ? (
                        <CheckCircle2 className="size-4 shrink-0 text-accent" />
                      ) : isActive ? (
                        <PlayCircle className="size-4 shrink-0 text-accent" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground/40 transition-colors duration-200 group-hover:text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "truncate transition-opacity duration-200",
                          isCompleted && !isActive && "opacity-70"
                        )}
                      >
                        {lesson.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        );
      })}
    </aside>
  );
}
