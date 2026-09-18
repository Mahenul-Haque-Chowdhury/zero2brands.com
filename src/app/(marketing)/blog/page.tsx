import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndexPage() {
  const admin = createAdminClient();
  const { data: posts } = await admin
    .from("blog_posts")
    .select("slug, title, excerpt, cover_image_url, published_at, lang")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Insights
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-muted-foreground">
          Practical notes on sourcing, branding and running a clothing
          business in Bangladesh.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {(posts ?? []).map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card className="h-full overflow-hidden transition-colors hover:border-accent/40 hover:bg-muted/40" lang={p.lang}>
              {p.cover_image_url ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={p.cover_image_url}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <CardHeader>
                <CardTitle className="text-lg font-heading">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>{p.excerpt}</p>
                {p.published_at ? (
                  <p className="text-xs">
                    {new Date(p.published_at).toLocaleDateString()}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}

        {(!posts || posts.length === 0) && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <p className="text-muted-foreground">
              No posts published yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
