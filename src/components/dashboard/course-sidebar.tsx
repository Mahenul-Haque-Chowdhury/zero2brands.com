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
  return (
    <aside className="w-full shrink-0 rounded-xl border border-border bg-card p-3 md:w-72">
      {modules.map((module, i) => (
        <div
          key={module.id}
          className={cn("mb-4 last:mb-0", i > 0 && "border-t border-border pt-4")}
        >
          <h3 className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {module.title}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {module.lessons
              .filter((l) => l.is_published)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((lesson) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isActive = lesson.slug === activeLessonSlug;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/dashboard/course/${lesson.slug}`}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted",
                        isActive && "bg-accent/10 font-medium text-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-4 shrink-0 text-accent" />
                      ) : isActive ? (
                        <PlayCircle className="size-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
