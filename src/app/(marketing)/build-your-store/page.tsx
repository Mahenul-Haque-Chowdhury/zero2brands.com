import type { Metadata } from "next";
import { Layers, Truck, Wallet } from "lucide-react";
import { LeadForm } from "@/components/marketing/lead-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Build Your Store" };

const FEATURES = [
  {
    icon: Wallet,
    title: "Payment integration",
    body: "bKash, Nagad and card payments wired up and ready to accept orders from day one.",
  },
  {
    icon: Truck,
    title: "Courier integration",
    body: "Connected to the courier services Bangladeshi shoppers already trust, with tracking built in.",
  },
  {
    icon: Layers,
    title: "Product management",
    body: "A store built for how Bangladeshi clothing sellers actually manage inventory and orders.",
  },
];

export default function BuildYourStorePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Build Your Store with GrayVally
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Once you&apos;ve built your brand, GrayVally Software Solutions can
          build the store to sell it from, payment integration, courier
          integration, and product management, built for the Bangladeshi
          market.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardContent>
              <f.icon className="size-7 text-accent" strokeWidth={1.75} />
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Interested?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us a bit about your business and we&apos;ll reach out.
        </p>
        <div className="mt-6 max-w-md">
          <LeadForm source="build_your_store" />
        </div>
      </div>
    </div>
  );
}
