import Link from "next/link";
import { CalendarDays, Users2 } from "lucide-react";
import { requireOnboarded } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Batches" };

export default async function MyBatchesPage() {
  const { user, supabase } = await requireOnboarded();

  const { data: enrollments } = await supabase
    .from("batch_enrollments")
    .select("batches(id, slug, title, starts_at, status)")
    .eq("user_id", user.id)
    .eq("status", "active");

  const batches = (enrollments ?? [])
    .map((e) => e.batches)
    .filter((b): b is NonNullable<typeof b> => !!b);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Batches</h1>
        <p className="mt-1 text-muted-foreground">
          Your enrolled live cohorts and their sessions.
        </p>
      </div>

      {batches.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users2 className="size-6" />
          </span>
          <p className="font-medium">You are not enrolled in any live batches yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Join a batch to get live sessions, a cohort group chat and
            direct feedback.
          </p>
          <Button size="sm" className="mt-1" render={<Link href="/batches" />}>
            Browse batches
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {batches.map((batch) => (
            <Link key={batch.id} href={`/dashboard/my-batches/${batch.slug}`}>
              <Card className="h-full transition-colors hover:border-accent/40 hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{batch.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Starts {new Date(batch.starts_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {batch.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
