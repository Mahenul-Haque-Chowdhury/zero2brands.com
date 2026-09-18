import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">My Batches</h1>
      {batches.length === 0 ? (
        <p className="text-muted-foreground">
          You are not enrolled in any live batches yet.{" "}
          <Link href="/batches" className="underline">
            Browse batches
          </Link>
        </p>
      ) : (
        <div className="grid gap-4">
          {batches.map((batch) => (
            <Link key={batch.id} href={`/dashboard/my-batches/${batch.slug}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{batch.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Starts {new Date(batch.starts_at).toLocaleDateString()} · {batch.status}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
