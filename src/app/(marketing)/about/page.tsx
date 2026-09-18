import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

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
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        About us
      </p>
      <h1 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">
        About Zero2Brands
      </h1>
      <div className="prose prose-neutral mt-8 max-w-none text-muted-foreground">
        {story ? (
          <p>{story}</p>
        ) : (
          <p>
            Zero2Brands was built to give aspiring clothing entrepreneurs in
            Bangladesh a real, practical path from idea to first sale, and
            beyond. The founder&apos;s story and photo go here once
            supplied.
          </p>
        )}
      </div>
    </div>
  );
}
