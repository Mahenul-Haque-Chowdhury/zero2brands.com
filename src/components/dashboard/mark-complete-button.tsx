"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkCompleteButton({
  lessonId,
  courseId,
  initiallyCompleted,
}: {
  lessonId: string;
  courseId: string;
  initiallyCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await fetch("/api/video/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          courseId,
          watchedSeconds: 999999, // server clamps this to plausible growth
          lastPositionSeconds: 0,
          ended: true,
        }),
      });
      setCompleted(true);
      router.refresh();
    });
  }

  if (completed) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
        <CheckCircle2 className="size-4" />
        Completed
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Marking
        </>
      ) : (
        "Mark as complete"
      )}
    </Button>
  );
}
