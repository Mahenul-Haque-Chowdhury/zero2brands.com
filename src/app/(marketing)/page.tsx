import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, PlayCircle, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/marketing/json-ld";

export const metadata: Metadata = {
  title: "Zero2Brands - Build a Clothing Brand From Zero",
  description:
    "A practical, step-by-step course and community for entrepreneurs starting a clothing business in Bangladesh. Lifetime access.",
};

const PILLARS = [
  {
    icon: PlayCircle,
    title: "A real curriculum",
    body: "Step-by-step video lessons covering sourcing, costing, branding and launch, not vague motivation.",
  },
  {
    icon: Users,
    title: "A working community",
    body: "Learn alongside other Bangladeshi entrepreneurs building the same kind of business as you.",
  },
  {
    icon: CheckCircle2,
    title: "Lifetime access",
    body: "Pay once. Revisit every lesson and resource for as long as you need, no subscription.",
  },
];

export default async function HomePage() {
  const admin = createAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("title, subtitle, price_bdt, compare_at_price_bdt")
    .eq("is_primary", true)
    .eq("is_published", true)
    .maybeSingle();

  const { data: testimonials } = await admin
    .from("testimonials")
    .select("name, business_name, quote, photo_url")
    .eq("is_published", true)
    .order("sort_order")
    .limit(3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Zero2Brands",
          url: process.env.NEXT_PUBLIC_SITE_URL,
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-hero">
        <div className="bg-brand-dots absolute inset-0" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
            For Bangladeshi entrepreneurs
          </span>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            {course?.title ?? "Build a clothing brand, from zero."}
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-white/75">
            {course?.subtitle ??
              "A practical, step-by-step course and community for entrepreneurs starting a clothing business in Bangladesh. Lifetime access, real curriculum, real community."}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-accent px-8 text-base font-medium text-accent-foreground hover:bg-accent/90"
              render={<Link href="/course">See the full course</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/25 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
              render={<Link href="/batches">Join a live batch</Link>}
            />
          </div>
          {course ? (
            <p className="mt-6 text-sm text-white/60">
              ৳{course.price_bdt.toLocaleString()}
              {course.compare_at_price_bdt ? (
                <span className="ml-2 line-through">
                  ৳{course.compare_at_price_bdt.toLocaleString()}
                </span>
              ) : null}{" "}
              &middot; lifetime access
            </p>
          ) : null}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Why entrepreneurs choose Zero2Brands
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent/40"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-accent/10">
                <p.icon className="size-5 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 ? (
        <section className="bg-muted/60 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                What students say
              </h2>
              <p className="mt-3 text-muted-foreground">
                Real entrepreneurs, real businesses, built with this course.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="h-full">
                  <CardContent className="flex h-full flex-col">
                    <p className="text-sm leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3 pt-1">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        {t.business_name ? (
                          <p className="text-xs text-muted-foreground">
                            {t.business_name}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-brand-hero py-16 sm:py-20 lg:py-24">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
            Ready to start building?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Get the full curriculum, the community and lifetime access in one
            purchase.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-accent px-8 text-base font-medium text-accent-foreground hover:bg-accent/90"
              render={<Link href="/course">See the full course</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/25 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
              render={<Link href="/batches">Join a live batch</Link>}
            />
          </div>
        </div>
      </section>
    </>
  );
}
