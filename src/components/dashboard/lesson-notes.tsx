"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, NotebookPen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LessonNotes({
  lessonId,
  initialContent,
}: {
  lessonId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("lesson_notes").upsert(
        { user_id: user.id, lesson_id: lessonId, content },
        { onConflict: "user_id,lesson_id" }
      );

      if (error) {
        toast.error("Could not save your note.");
        return;
      }
      toast.success("Note saved.");
    });
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <NotebookPen className="size-4 text-muted-foreground" />
        Your notes
      </h2>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Private notes for this lesson, only you can see these."
        rows={4}
      />
      <Button
        size="sm"
        className="mt-3"
        onClick={handleSave}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving
          </>
        ) : (
          "Save note"
        )}
      </Button>
    </div>
  );
}
