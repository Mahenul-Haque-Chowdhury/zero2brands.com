import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
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
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24" lang={post.lang}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.published_at,
          author: { "@type": "Organization", name: "Zero2Brands" },
        }}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>
      <h1 className="mt-6 text-balance text-3xl font-semibold font-heading sm:text-4xl">
        {post.title}
      </h1>
      {post.published_at ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      ) : null}
      <div
        className="prose prose-neutral mt-10 max-w-none text-foreground prose-headings:font-heading prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: post.content_html ?? "" }}
      />
    </article>
  );
}
