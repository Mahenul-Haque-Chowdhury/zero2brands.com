import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { JsonLd } from "@/components/marketing/json-ld";
import { Reveal } from "@/components/motion/reveal";

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
      <Reveal>
        <h1 className="mt-6 text-balance text-3xl font-semibold font-heading sm:text-4xl">
          {post.title}
        </h1>
        {post.published_at ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString()}
          </p>
        ) : null}
        <hr className="mt-8 border-border" />
      </Reveal>
      <div
        className="prose prose-neutral mt-10 max-w-none text-base leading-relaxed text-foreground prose-headings:font-heading prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-p:leading-relaxed prose-a:text-primary prose-a:underline-offset-4 prose-strong:text-foreground prose-img:rounded-xl prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: post.content_html ?? "" }}
      />
    </article>
  );
}
