import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "About" };

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

      {/* One considered paragraph rather than a card grid: the story from
          site_settings (with its placeholder fallback) followed by what the
          course is, folded into continuous prose instead of a separate
          "principles" section. */}
      <section className="mx-auto max-w-360 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Reveal className="mx-auto max-w-2xl">
          <p className="text-balance text-xl leading-relaxed text-foreground sm:text-2xl">
            {story ??
              "Zero2Brands was built to give aspiring clothing entrepreneurs in Bangladesh a real, practical path from idea to first sale, and beyond."}
            {" "}This is a practical path, not motivation: sourcing, costing,
            branding and launch, covered step by step in the order you
            actually need them, built for Bangladesh, where the suppliers,
            the pricing and the customers are all local. One payment gets
            you lifetime access to every lesson and resource, with no
            subscription attached, so what you pay for is what you keep.
          </p>
        </Reveal>
      </section>
    </>
  );
}
