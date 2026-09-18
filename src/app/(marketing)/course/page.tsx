import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Infinity as InfinityIcon, PlayCircle, Award } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BuyButton } from "@/components/marketing/buy-button";
import { JsonLd } from "@/components/marketing/json-ld";
import { ViewContentTracker } from "@/components/marketing/view-content-tracker";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const admin = createAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("seo_title, seo_description, title, description")
    .eq("is_primary", true)
    .maybeSingle();

  return {
    title: course?.seo_title ?? course?.title ?? "Course",
    description: course?.seo_description ?? course?.description ?? undefined,
  };
}

export default async function CourseSalesPage() {
  const admin = createAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("*")
    .eq("is_primary", true)
    .eq("is_published", true)
    .maybeSingle();

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
        The course is not available right now.
      </div>
    );
  }

  const { data: outline } = await admin
    .from("course_outline_public")
    .select("*")
    .eq("course_id", course.id)
    .order("global_order");

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("course_id", course.id)
    .eq("type", "course")
    .maybeSingle();

  const { data: faqs } = await admin
    .from("faqs")
    .select("question, answer")
    .eq("is_published", true)
    .in("category", ["general", "payments"]);

  const modulesByTitle = new Map<string, typeof outline>();
  for (const lesson of outline ?? []) {
    const key = `${lesson.module_sort_order}:${lesson.module_title}`;
    if (!modulesByTitle.has(key)) modulesByTitle.set(key, []);
    modulesByTitle.get(key)!.push(lesson);
  }

  const outcomes = Array.isArray(course.outcomes) ? course.outcomes : [];

  return (
    <>
      <ViewContentTracker contentId={course.id} contentName={course.title} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description,
          provider: { "@type": "Organization", name: "Zero2Brands" },
          offers: {
            "@type": "Offer",
            price: course.price_bdt,
            priceCurrency: "BDT",
          },
        }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-aurora">
        <div className="bg-brand-grid mask-fade-edges absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <Reveal>
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
              The complete course
            </span>
          </Reveal>

          <Reveal delay={0.08} className="w-full">
            <h1 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
          </Reveal>

          <Reveal delay={0.16} className="w-full">
            <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-white/75">
              {course.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-7 flex items-center justify-center gap-3">
              <span className="text-4xl font-semibold text-white">
                ৳{course.price_bdt.toLocaleString()}
              </span>
              {course.compare_at_price_bdt ? (
                <span className="text-lg text-white/50 line-through">
                  ৳{course.compare_at_price_bdt.toLocaleString()}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-white/60">
              One-time payment, lifetime access
            </p>
          </Reveal>

          {product ? (
            <Reveal delay={0.32}>
              <div className="mt-7 flex justify-center">
                <BuyButton productId={product.id} />
              </div>
            </Reveal>
          ) : null}

          <RevealGroup className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {[
              { icon: InfinityIcon, label: "Lifetime access" },
              { icon: PlayCircle, label: "Step-by-step video lessons" },
              { icon: Award, label: "Certificate on completion" },
            ].map((item) => (
              <RevealItem key={item.label}>
                <span className="inline-flex items-center gap-2 text-sm text-white/70">
                  <item.icon
                    className="size-4 shrink-0 text-accent"
                    strokeWidth={1.75}
                  />
                  {item.label}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        {course.trailer_video_id ? (
          <Reveal>
            <div className="mt-12 aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
              <iframe
                src={`https://iframe.mediadelivery.net/embed/${process.env.BUNNY_STREAM_LIBRARY_ID}/${course.trailer_video_id}`}
                className="h-full w-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </div>
          </Reveal>
        ) : null}

        {outcomes.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <Reveal className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                Outcomes
              </span>
              <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">
                What you&apos;ll learn
              </h2>
            </Reveal>
            <RevealGroup className="mt-8 grid gap-3 sm:grid-cols-2">
              {outcomes.map((o, i) => (
                <RevealItem key={i}>
                  <div className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{String(o)}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ) : null}

        <section className="mt-16 sm:mt-20">
          <Reveal className="mb-8 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Curriculum
            </span>
            <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">
              Full roadmap
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every module, lesson by lesson, so you know exactly what you are
              getting before you pay.
            </p>
          </Reveal>
          <Accordion
            multiple={false}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {[...modulesByTitle.entries()].map(([key, lessons]) => {
              const moduleTitle = key.split(":").slice(1).join(":");
              const totalMinutes = Math.round(
                (lessons ?? []).reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0) / 60
              );
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="px-4">
                    <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pr-2 text-left">
                      <span className="font-medium">{moduleTitle}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {lessons?.length} lessons &middot; {totalMinutes} min
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <ul className="flex flex-col gap-1">
                      {(lessons ?? []).map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-3 border-t border-border/60 py-2 text-sm first:border-t-0"
                        >
                          <span>
                            {l.title}{" "}
                            {l.is_preview ? (
                              <span className="ml-1 text-xs font-medium text-accent">
                                Free preview
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {Math.round((l.duration_seconds ?? 0) / 60)} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        <section className="mt-16 sm:mt-20">
          <Reveal>
            <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                Included
              </span>
              <h2 className="mt-3 text-balance text-xl font-semibold sm:text-2xl">
                What&apos;s included
              </h2>
              <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Lifetime access to every lesson, no expiry, no subscription",
                  "A community of other students building the same thing",
                  "Downloadable resources: costing sheets, supplier lists, templates",
                  "A certificate on completion",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card p-4"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {faqs && faqs.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <Reveal className="mb-8 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                Questions
              </span>
              <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">
                FAQ
              </h2>
            </Reveal>
            <Accordion
              multiple={false}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="px-4">{f.question}</AccordionTrigger>
                  <AccordionContent className="px-4">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        <section className="mt-16 sm:mt-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-brand-hero px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="bg-brand-dots absolute inset-0" />
              <div className="relative">
                <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
                  Ready to build your brand?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-balance text-white/70">
                  One payment, lifetime access, and a roadmap you can start
                  following today.
                </p>
                <div className="mt-8 flex justify-center">
                  {product ? (
                    <BuyButton productId={product.id} />
                  ) : (
                    <Button
                      size="lg"
                      render={<Link href="/contact">Get in touch</Link>}
                    />
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      {/* Sticky mobile buy bar */}
      {product ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-4px_20px_rgba(11,31,53,0.08)] backdrop-blur-md md:hidden">
          <BuyButton productId={product.id} fullWidth />
        </div>
      ) : null}
    </>
  );
}
