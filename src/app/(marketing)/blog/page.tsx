import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndexPage() {
  const admin = createAdminClient();
  const { data: posts } = await admin
    .from("blog_posts")
    .select("slug, title, excerpt, cover_image_url, published_at, lang")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <>
      <section className="relative overflow-hidden bg-brand-hero">
        <div className="bg-brand-dots absolute inset-0" />
        <div className="relative mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
                Insights
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                Blog
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 text-lg leading-relaxed text-white/75">
                Practical notes on sourcing, branding and running a clothing
                business in Bangladesh.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <RevealGroup className="grid gap-5 sm:grid-cols-2">
          {(posts ?? []).map((p) => (
            <RevealItem key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card
                  className="h-full overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                  lang={p.lang}
                >
                  {p.cover_image_url ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <Image
                        src={p.cover_image_url}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <CardHeader className={p.cover_image_url ? "pt-6" : undefined}>
                    <CardTitle className="text-lg font-heading transition-colors duration-300 group-hover:text-accent">
                      {p.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p className="leading-relaxed">{p.excerpt}</p>
                    {p.published_at ? (
                      <p className="text-xs">
                        {new Date(p.published_at).toLocaleDateString()}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            </RevealItem>
          ))}

          {(!posts || posts.length === 0) && (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
              <p className="text-muted-foreground">
                No posts published yet. Check back soon.
              </p>
            </div>
          )}
        </RevealGroup>
      </div>
    </>
  );
}
