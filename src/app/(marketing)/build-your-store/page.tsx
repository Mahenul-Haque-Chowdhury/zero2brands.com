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
  Truck,
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

/** Figures published on grayvally.tech. */
const STATS = [
  { value: "25+", label: "Clients and partners" },
  { value: "50+", label: "Projects delivered" },
  { value: "10+", label: "Years combined experience" },
];

/** Client names listed publicly on grayvally.tech. */
const CLIENTS = [
  "Menz Look",
  "CourseLogistics",
  "Vephyr",
  "Crystal Valley",
  "Dainik New Times",
  "ZTec Group",
  "Scan2Call",
  "Buildify",
  "Intovah",
];

const PROCESS = [
  {
    step: "01",
    title: "Discovery and alignment",
    body: "Before anything is built, we agree on what the store has to do and who it is for.",
  },
  {
    step: "02",
    title: "Milestone-based build",
    body: "Weekly updates, clear milestones, and no hidden surprises. You see visible progress checkpoints, not a black box.",
  },
  {
    step: "03",
    title: "Launch and hand over",
    body: "Production-ready testing, then the store goes live with you in control of it.",
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

              {/* Stats */}
              <RevealGroup className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
                {STATS.map((s) => (
                  <RevealItem key={s.label} className="bg-[#0b1f35] px-5 py-5">
                    <p className="text-2xl font-semibold tabular-nums text-accent sm:text-3xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-sm text-white/60">{s.label}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>

            {/* Right: form and contact */}
            <Reveal delay={0.12} className="scroll-mt-24">
              <div className="rounded-2xl border border-white/12 bg-white/4 p-6 backdrop-blur-sm sm:p-8">
                <h2 className="text-xl font-semibold text-white">
                  Tell GrayVally about your brand
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  Send a few details and the team will reach out, usually
                  within one to two business days.
                </p>
                <div className="mt-6 [&_label]:text-white/80">
                  <LeadForm source="build_your_store" />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/3 p-6 text-sm">
                <a
                  href="mailto:contact@grayvally.tech"
                  className="flex items-center gap-3 text-white/75 transition-colors hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-accent" />
                  contact@grayvally.tech
                </a>
                <a
                  href="tel:+8801608613747"
                  className="flex items-center gap-3 text-white/75 transition-colors hover:text-white"
                >
                  <Phone className="size-4 shrink-0 text-accent" />
                  +880 1608-613747
                </a>
                <p className="flex items-start gap-3 text-white/75">
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

      {/* Featured case study: Menz Look */}
      <section className="border-y border-border bg-muted/40 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Case study
            </span>
            <h2 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">
              Menz Look, a clothing brand selling online
            </h2>
            <p className="mt-3 text-muted-foreground">
              The closest thing to what you are building: a menswear
              storefront made for the Bangladeshi market.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {[
                {
                  label: "What it is",
                  value:
                    "A budget-friendly menswear storefront, built mobile-first for how customers actually shop.",
                },
                {
                  label: "Built with",
                  value:
                    "Next.js, Framer Motion and Supabase. The same stack this site runs on.",
                },
                {
                  label: "Timeline",
                  value:
                    "4 to 6 weeks from kickoff to a live, order-taking store.",
                },
              ].map((c) => (
                <div key={c.label} className="bg-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
              <Truck className="size-4 shrink-0 text-accent" />
              <p className="text-sm text-foreground">
                Fast cash-on-delivery checkout, WhatsApp-driven support, and
                no third-party platform fees eating the margin.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clients */}
      <section className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Teams that have worked with GrayVally
          </p>
        </Reveal>
        <RevealGroup className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
          {CLIENTS.map((c) => (
            <RevealItem key={c}>
              <span className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:border-accent/40 hover:text-foreground">
                {c}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-lg text-center text-xs text-muted-foreground">
            Many GrayVally engagements are confidential under client NDAs, so
            this is only the publicly named work.
          </p>
        </Reveal>
      </section>

      {/* Process */}
      <section className="relative overflow-hidden bg-brand-hero py-16 sm:py-20 lg:py-24">
        <div className="bg-brand-dots absolute inset-0" />
        <div className="relative mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              How it works
            </span>
            <h2 className="mt-3 text-balance text-2xl font-semibold text-white sm:text-3xl">
              Discovery first, then a build you can watch happen
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-3">
            {PROCESS.map((p) => (
              <RevealItem key={p.step}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors duration-300 hover:border-accent/30">
                  <span className="font-mono text-sm font-semibold text-accent">
                    {p.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {p.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

    </>
  );
}
