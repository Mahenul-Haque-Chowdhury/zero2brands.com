import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
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
      <section className="relative overflow-hidden bg-brand-hero">
        <div className="bg-brand-dots absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <h1 className="text-balance text-3xl font-semibold text-white sm:text-4xl">
            {course.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
            {course.subtitle}
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="text-3xl font-semibold text-white">
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
          {product ? (
            <div className="mt-7 flex justify-center">
              <BuyButton productId={product.id} />
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        {course.trailer_video_id ? (
          <div className="mt-12 aspect-video overflow-hidden rounded-xl border border-border bg-black shadow-sm">
            <iframe
              src={`https://iframe.mediadelivery.net/embed/${process.env.BUNNY_STREAM_LIBRARY_ID}/${course.trailer_video_id}`}
              className="h-full w-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          </div>
        ) : null}

        {outcomes.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <h2 className="mb-6 text-2xl font-semibold">What you&apos;ll learn</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {outcomes.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{String(o)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16 sm:mt-20">
          <h2 className="mb-6 text-2xl font-semibold">Full curriculum</h2>
          <Accordion multiple={false} className="rounded-xl border border-border">
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

        <section className="mt-16 rounded-xl border border-border bg-muted/40 p-6 sm:mt-20 sm:p-8">
          <h2 className="mb-4 text-xl font-semibold">What&apos;s included</h2>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            {[
              "Lifetime access to every lesson, no expiry, no subscription",
              "A community of other students building the same thing",
              "Downloadable resources: costing sheets, supplier lists, templates",
              "A certificate on completion",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {faqs && faqs.length > 0 ? (
          <section className="mt-16 sm:mt-20">
            <h2 className="mb-6 text-2xl font-semibold">FAQ</h2>
            <Accordion multiple={false} className="rounded-xl border border-border">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="px-4">{f.question}</AccordionTrigger>
                  <AccordionContent className="px-4">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        <div className="mt-16 text-center sm:mt-20">
          <h2 className="text-balance text-2xl font-semibold">
            Ready to build your brand?
          </h2>
          <div className="mt-6">
            {product ? (
              <BuyButton productId={product.id} />
            ) : (
              <Button size="lg" render={<Link href="/contact">Get in touch</Link>} />
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      {product ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-sm md:hidden">
          <BuyButton productId={product.id} fullWidth />
        </div>
      ) : null}
    </>
  );
}
