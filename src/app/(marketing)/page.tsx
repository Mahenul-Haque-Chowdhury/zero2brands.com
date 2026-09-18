import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/marketing/json-ld";

export const metadata: Metadata = {
  title: "Zero2Brands — Build a Clothing Brand From Zero",
  description:
    "A practical, step-by-step course and community for entrepreneurs starting a clothing business in Bangladesh. Lifetime access.",
};

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
      <main className="flex flex-col items-center px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {course?.title ?? "Build a clothing brand, from zero."}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          {course?.subtitle ??
            "A practical, step-by-step course and community for entrepreneurs starting a clothing business in Bangladesh. Lifetime access, real curriculum, real community."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/course">See the full course</Link>} />
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/batches">Join a live batch</Link>}
          />
        </div>
        {course ? (
          <p className="mt-4 text-sm text-muted-foreground">
            ৳{course.price_bdt.toLocaleString()}
            {course.compare_at_price_bdt ? (
              <span className="ml-2 line-through">
                ৳{course.compare_at_price_bdt.toLocaleString()}
              </span>
            ) : null}{" "}
            · lifetime access
          </p>
        ) : null}
      </main>

      {testimonials && testimonials.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            What students say
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-lg border p-6">
                <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-medium">{t.name}</p>
                {t.business_name ? (
                  <p className="text-xs text-muted-foreground">{t.business_name}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
