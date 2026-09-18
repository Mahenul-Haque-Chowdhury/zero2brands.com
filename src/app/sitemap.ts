import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zero2brands.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/course`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/batches`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/build-your-store`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [{ data: batches }, { data: posts }] = await Promise.all([
    admin.from("batches").select("slug, updated_at").neq("status", "cancelled"),
    admin.from("blog_posts").select("slug, updated_at").eq("is_published", true),
  ]);

  const batchPages: MetadataRoute.Sitemap = (batches ?? []).map((b) => ({
    url: `${SITE_URL}/batches/${b.slug}`,
    lastModified: b.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...batchPages, ...blogPages];
}
