import Link from "next/link";
import type { Metadata } from "next";
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
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">{course.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{course.subtitle}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-2xl font-semibold">
              ৳{course.price_bdt.toLocaleString()}
            </span>
            {course.compare_at_price_bdt ? (
              <span className="text-lg text-muted-foreground line-through">
                ৳{course.compare_at_price_bdt.toLocaleString()}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            One-time payment · lifetime access
          </p>
          {product ? (
            <div className="mt-6">
              <BuyButton productId={product.id} />
            </div>
          ) : null}
        </div>

        {course.trailer_video_id ? (
          <div className="mt-12 aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              src={`https://iframe.mediadelivery.net/embed/${process.env.BUNNY_STREAM_LIBRARY_ID}/${course.trailer_video_id}`}
              className="h-full w-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          </div>
        ) : null}

        {outcomes.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-4 text-2xl font-semibold">What you&apos;ll learn</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {String(o)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold">Full curriculum</h2>
          <Accordion multiple={false}>
            {[...modulesByTitle.entries()].map(([key, lessons]) => {
              const moduleTitle = key.split(":").slice(1).join(":");
              const totalMinutes = Math.round(
                (lessons ?? []).reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0) / 60
              );
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger>
                    {moduleTitle}{" "}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {lessons?.length} lessons · {totalMinutes} min
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-1">
                      {(lessons ?? []).map((l) => (
                        <li key={l.id} className="flex items-center justify-between text-sm">
                          <span>
                            {l.title} {l.is_preview ? "(free preview)" : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
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

        <section className="mt-16 rounded-lg border p-6">
          <h2 className="mb-2 text-xl font-semibold">What&apos;s included</h2>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>Lifetime access to every lesson — no expiry, no subscription</li>
            <li>A community of other students building the same thing</li>
            <li>Downloadable resources: costing sheets, supplier lists, templates</li>
            <li>A certificate on completion</li>
          </ul>
        </section>

        {faqs && faqs.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-4 text-2xl font-semibold">FAQ</h2>
            <Accordion multiple={false}>
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent>{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        <div className="mt-16 text-center">
          {product ? (
            <BuyButton productId={product.id} />
          ) : (
            <Button size="lg" render={<Link href="/contact">Get in touch</Link>} />
          )}
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      {product ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-3 md:hidden">
          <BuyButton productId={product.id} fullWidth />
        </div>
      ) : null}
    </>
  );
}
