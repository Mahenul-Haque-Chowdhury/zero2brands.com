import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Users2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { BuyButton } from "@/components/marketing/buy-button";
import { Badge } from "@/components/ui/badge";
import { nowMs } from "@/lib/utils/dates";
import { Reveal } from "@/components/motion/reveal";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: batch } = await admin
    .from("batches")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!batch || batch.status === "cancelled") notFound();

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("batch_id", batch.id)
    .eq("type", "batch")
    .maybeSingle();

  const seatsLeft = batch.seat_limit - batch.seats_taken;
  const now = nowMs();
  const opensAt = batch.enrollment_opens_at ? new Date(batch.enrollment_opens_at).getTime() : 0;
  const closesAt = batch.enrollment_closes_at
    ? new Date(batch.enrollment_closes_at).getTime()
    : Infinity;

  let state: "not_open" | "open" | "full" | "closed" = "open";
  if (now < opensAt) state = "not_open";
  else if (seatsLeft <= 0) state = "full";
  else if (now > closesAt) state = "closed";

  return (
    <>
      <section className="relative overflow-hidden bg-brand-aurora">
        <div className="bg-brand-grid mask-fade-edges absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <Link
              href="/batches"
              className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              All batches
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {batch.title}
            </h1>
          </Reveal>

          {batch.description ? (
            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">
                {batch.description}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-4xl font-semibold text-white">
                ৳{batch.price_bdt.toLocaleString()}
              </span>
              {batch.compare_at_price_bdt ? (
                <span className="text-lg text-white/50 line-through">
                  ৳{batch.compare_at_price_bdt.toLocaleString()}
                </span>
              ) : null}
            </div>
            {batch.includes_course_access ? (
              <p className="mt-2 text-sm text-white/60">
                Includes lifetime access to the recorded course.
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5 text-sm sm:p-6">
            {batch.schedule_note ? (
              <p className="flex items-start gap-2 text-foreground">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-accent" />
                {batch.schedule_note}
              </p>
            ) : null}
            <p className="flex items-center gap-2">
              <Users2 className="size-4 shrink-0 text-accent" />
              <Badge variant={seatsLeft > 0 ? "default" : "destructive"}>
                {seatsLeft > 0
                  ? `${seatsLeft} of ${batch.seat_limit} seats left`
                  : "Full"}
              </Badge>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8">
            {state === "open" && product ? (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Enrollment is open for this cohort.
                </p>
                <div className="mt-4 flex justify-center">
                  <BuyButton productId={product.id} />
                </div>
              </div>
            ) : state === "not_open" ? (
              <p className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Enrollment opens{" "}
                {new Date(batch.enrollment_opens_at!).toLocaleDateString()}.
              </p>
            ) : state === "full" ? (
              <p className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                This batch is full. Check the batches page for other open
                cohorts.
              </p>
            ) : (
              <p className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Enrollment has closed for this batch.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </>
  );
}
