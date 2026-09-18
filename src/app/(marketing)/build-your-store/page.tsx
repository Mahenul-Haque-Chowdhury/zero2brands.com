import type { Metadata } from "next";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Build Your Store" };

export default function BuildYourStorePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Build Your Store with GrayVally</h1>
      <p className="mt-4 text-muted-foreground">
        Once you&apos;ve built your brand, GrayVally Software Solutions can
        build the store to sell it from — payment integration, courier
        integration, and product management, built for the Bangladeshi
        market.
      </p>
      <div className="mt-10">
        <h2 className="mb-3 text-xl font-semibold">Interested?</h2>
        <LeadForm source="build_your_store" />
      </div>
    </div>
  );
}
