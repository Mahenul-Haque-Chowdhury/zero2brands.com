import Link from "next/link";
import type { Metadata } from "next";
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
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(posts ?? []).map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50" lang={p.lang}>
              <CardHeader>
                <CardTitle className="text-lg">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {p.excerpt}
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-muted-foreground">No posts published yet.</p>
        )}
      </div>
    </div>
  );
}
