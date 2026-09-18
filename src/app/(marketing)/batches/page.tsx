import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Users2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Live Batches" };

export default async function BatchesPage() {
  const admin = createAdminClient();
  const { data: batches } = await admin
    .from("batches")
    .select("slug, title, price_bdt, seat_limit, seats_taken, starts_at, status")
    .neq("status", "cancelled")
    .order("starts_at");

  return (
    <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-medium tracking-wide text-accent uppercase">
          Live cohorts
        </span>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Live Batches
        </h1>
        <p className="mt-3 text-muted-foreground">
          Seat-limited cohorts with scheduled live sessions, sold separately
          from the recorded course.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {(batches ?? []).map((b) => {
          const seatsLeft = b.seat_limit - b.seats_taken;
          return (
            <Link
              key={b.slug}
              href={`/batches/${b.slug}`}
              className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{b.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <p className="text-xl font-semibold text-foreground">
                    ৳{b.price_bdt.toLocaleString()}
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    Starts {new Date(b.starts_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Users2 className="size-4 text-muted-foreground" />
                    <Badge variant={seatsLeft > 0 ? "default" : "destructive"}>
                      {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {(!batches || batches.length === 0) && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <p className="text-muted-foreground">
              No batches are open right now. Check back soon, or explore the
              self-paced course instead.
            </p>
            <Link
              href="/course"
              className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
            >
              See the full course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
