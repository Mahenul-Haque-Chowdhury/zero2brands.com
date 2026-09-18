import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Users2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Live Batches" };

export default async function BatchesPage() {
  const admin = createAdminClient();
  const { data: batches } = await admin
    .from("batches")
    .select("slug, title, price_bdt, seat_limit, seats_taken, starts_at, status")
    .neq("status", "cancelled")
    .order("starts_at");

  return (
    <>
      <section className="relative overflow-hidden bg-brand-hero">
        <div className="bg-brand-dots absolute inset-0" />
        <div className="relative mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
                Live cohorts
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                Live Batches
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 text-lg leading-relaxed text-white/75">
                Seat-limited cohorts with scheduled live sessions, sold
                separately from the recorded course.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <RevealGroup className="grid gap-5 sm:grid-cols-2">
        {(batches ?? []).map((b) => {
          const seatsLeft = b.seat_limit - b.seats_taken;
          return (
            <RevealItem key={b.slug}>
              <Link
                href={`/batches/${b.slug}`}
                className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">
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
            </RevealItem>
          );
        })}

        {(!batches || batches.length === 0) && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
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
      </RevealGroup>
      </div>
    </>
  );
}
