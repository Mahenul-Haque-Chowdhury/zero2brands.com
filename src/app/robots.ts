import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zero2brands.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /dashboard covers the student directory and public profiles too —
      // student data must never be indexed. Disallowing the parent path is
      // deliberate and correct, not an oversight.
      disallow: ["/dashboard", "/admin", "/api", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
