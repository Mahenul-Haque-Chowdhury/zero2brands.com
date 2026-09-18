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
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">About Zero2Brands</h1>
      <div className="prose mt-6 max-w-none text-muted-foreground">
        {story ? (
          <p>{story}</p>
        ) : (
          <p>
            Zero2Brands was built to give aspiring clothing entrepreneurs in
            Bangladesh a real, practical path from idea to first sale — and
            beyond. The founder&apos;s story and photo go here once supplied.
          </p>
        )}
      </div>
    </div>
  );
}
