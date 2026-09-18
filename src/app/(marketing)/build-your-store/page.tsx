import type { Metadata } from "next";
import {
  ArrowUpRight,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { LeadForm } from "@/components/marketing/lead-form";
import { GrayVallyWordmark } from "@/components/marketing/grayvally-wordmark";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Build Your Store",
  description:
    "Finished the course? GrayVally Software Solutions, our partner studio, builds the storefront you sell your brand from.",
};

/** Services taken from grayvally.tech's own service list. */
const SERVICES = [
  {
    icon: Wallet,
    title: "E-commerce solutions",
    body: "A storefront built to take orders, not a template you have to fight. Cash on delivery works the way Bangladeshi shoppers expect it to.",
  },
  {
    icon: Smartphone,
    title: "Website and app development",
    body: "Mobile-first builds, because that is where your customers already are. Fast on a mid-range Android, not just on a designer's laptop.",
  },
  {
    icon: Layers,
    title: "Custom software and automation",
    body: "Inventory, orders and the repetitive work behind them, handled by software instead of by you at midnight.",
  },
  {
    icon: Search,
    title: "SEO and digital marketing",
    body: "Performance, accessibility and SEO are built into the workflow rather than treated as add-ons.",
  },
  {
    icon: ShieldCheck,
    title: "Database and server management",
    body: "Boring infrastructure: systems that just work, scale, and remain secure while you concentrate on selling.",
  },
  {
    icon: MessageCircle,
    title: "Maintenance and support",
    body: "Bug fixing, hosting, SSL and technical support once you are live, so a broken checkout is never your problem alone.",
  },
];

export default function BuildYourStorePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-aurora">
        <div className="bg-brand-grid mask-fade-edges absolute inset-0" />
        <div className="relative mx-auto max-w-360 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: pitch */}
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
                  In partnership with
                  <GrayVallyWordmark className="text-sm normal-case tracking-normal text-white" />
                </span>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 className="mt-7 text-balance text-4xl font-semibold text-white sm:text-5xl">
                  You built the brand. Now build the store.
                </h1>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                  Zero2Brands teaches you to build a clothing brand.{" "}
                  <GrayVallyWordmark className="font-semibold text-white" />{" "}
                  Software Solutions, our partner studio, builds the
                  storefront you sell it from. Same market, same standards,
                  one handover.
                </p>
              </Reveal>

              <Reveal delay={0.24}>
                <a
                  href="https://grayvally.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-12 items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/5 px-7 text-base text-white transition-colors duration-200 hover:bg-white/10"
                >
                  Visit grayvally.tech
                  <ArrowUpRight className="size-4" />
                </a>
              </Reveal>
            </div>

            {/* Right: form and contact */}
            <Reveal delay={0.12} className="scroll-mt-24">
              <div className="rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-black/5 sm:p-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Tell GrayVally about your brand
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Send a few details and the team will reach out, usually
                  within one to two business days.
                </p>
                <div className="mt-6">
                  <LeadForm source="build_your_store" />
                </div>
              </div>

              {/* Sits directly under the white card, so it stays on the navy
                  surface but is indented to read as part of the same column
                  rather than a second competing panel. */}
              <div className="mt-6 flex flex-col gap-3 px-1 text-sm sm:px-2">
                <a
                  href="mailto:contact@grayvally.tech"
                  className="flex items-center gap-3 text-white/70 transition-colors hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-accent" />
                  contact@grayvally.tech
                </a>
                <a
                  href="tel:+8801608613747"
                  className="flex items-center gap-3 text-white/70 transition-colors hover:text-white"
                >
                  <Phone className="size-4 shrink-0 text-accent" />
                  +880 1608-613747
                </a>
                <p className="flex items-start gap-3 text-white/70">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  House 629-630, Road 5, Block G, Bashundhara RA, Dhaka 1229
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            What they build
          </span>
          <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">
            Everything between your brand and your first online order
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <RevealItem key={s.title}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">
                <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 transition-colors duration-300 group-hover:bg-accent/15">
                  <s.icon className="size-5 text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

    </>
  );
}
