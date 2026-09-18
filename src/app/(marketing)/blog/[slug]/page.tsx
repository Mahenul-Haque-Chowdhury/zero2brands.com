import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { JsonLd } from "@/components/marketing/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("seo_title, seo_description, title, excerpt, og_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!post) return {};

  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    openGraph: post.og_image_url ? { images: [post.og_image_url] } : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: post } = await admin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16" lang={post.lang}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.published_at,
          author: { "@type": "Organization", name: "Zero2Brands" },
        }}
      />
      <h1 className="text-3xl font-semibold">{post.title}</h1>
      {post.published_at ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      ) : null}
      <div
        className="prose mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content_html ?? "" }}
      />
    </article>
  );
}
