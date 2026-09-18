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
    <aside className="w-full shrink-0 rounded-lg border p-3 md:w-72">
      {modules.map((module) => (
        <div key={module.id} className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {module.title}
          </h3>
          <ul className="flex flex-col gap-1">
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
                        "flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted",
                        isActive && "bg-muted font-medium"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      ) : isActive ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
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
