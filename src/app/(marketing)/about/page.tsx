import type { Metadata } from "next";
import Link from "next/link";
import { Compass, HeartHandshake, Route } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "About" };

/**
 * Descriptions of what the product already is, not biographical claims.
 * The founder's own story comes from the `founder_story` site_settings row.
 */
const PRINCIPLES = [
  {
    icon: Route,
    title: "A practical path, not motivation",
    body: "Sourcing, costing, branding and launch, covered step by step in the order you actually need them.",
  },
  {
    icon: Compass,
    title: "Built for Bangladesh",
    body: "The suppliers, the pricing and the customers are local, so the guidance is too.",
  },
  {
    icon: HeartHandshake,
    title: "You keep what you pay for",
    body: "One payment, lifetime access to every lesson and resource, with no subscription attached.",
  },
];

export default async function AboutPage() {
  const admin = createAdminClient();
  const { data: settings } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "founder_story")
    .maybeSingle();

  const story = (settings?.value as { text?: string } | null)?.text;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-aurora">
        <div className="bg-brand-grid mask-fade-edges absolute inset-0" />
        <div className="relative mx-auto max-w-360 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
                About us
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-balance text-4xl font-semibold text-white sm:text-5xl">
                About Zero2Brands
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                A practical path from idea to first sale for clothing
                entrepreneurs in Bangladesh.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Founder story, straight from site_settings with its placeholder fallback. */}
      <section className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Our story
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="prose prose-neutral mt-4 max-w-none text-base leading-relaxed text-muted-foreground">
              {story ? (
                <p>{story}</p>
              ) : (
                <p>
                  Zero2Brands was built to give aspiring clothing entrepreneurs
                  in Bangladesh a real, practical path from idea to first sale,
                  and beyond. The founder&apos;s story and photo go here once
                  supplied.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              What we stand for
            </span>
            <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">
              How this course is put together
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <RevealItem key={p.title}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 transition-colors duration-300 group-hover:bg-accent/15">
                    <p.icon className="size-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-brand-hero px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="bg-brand-dots absolute inset-0" />
            <div className="relative">
              <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
                Start where the roadmap starts
              </h2>
              <p className="mx-auto mt-3 max-w-md text-balance text-white/70">
                See exactly what the course covers before you decide.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/course"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-accent-foreground transition-transform duration-200 hover:bg-accent/90 active:scale-[0.98]"
                >
                  See the full course
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-8 text-base text-white transition-colors duration-200 hover:bg-white/10"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
