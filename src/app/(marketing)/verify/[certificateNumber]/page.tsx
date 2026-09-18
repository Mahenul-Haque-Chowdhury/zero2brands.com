import Link from "next/link";
import { BadgeCheck, SearchX, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reveal } from "@/components/motion/reveal";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateNumber: string }>;
}) {
  const { certificateNumber } = await params;
  const admin = createAdminClient();

  // Public verification route: returns ONLY name, course and date, via the
  // service_role client rather than exposing certificates to anon in RLS.
  const { data: cert } = await admin
    .from("certificates")
    .select("certificate_number, issued_at, is_revoked, courses(title), profiles:user_id(full_name)")
    .eq("certificate_number", certificateNumber)
    .maybeSingle();

  const verified = Boolean(cert && !cert.is_revoked);

  if (verified && cert) {
    return (
      <div className="relative overflow-hidden">
        <div className="bg-brand-aurora absolute inset-0" />
        <div className="bg-brand-grid mask-fade-edges absolute inset-0" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
          <Reveal>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent ring-8 ring-accent/5">
              <BadgeCheck className="size-8" strokeWidth={1.75} />
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              <ShieldCheck className="size-3.5" />
              Verified certificate
            </p>
            <h1 className="mt-3 text-balance text-2xl font-semibold text-white sm:text-3xl">
              This certificate is genuine
            </h1>
          </Reveal>

          {/* The screenshot-worthy card: the credential itself, on its own
              light surface so it stays legible when shared. */}
          <Reveal delay={0.18} className="w-full">
            <div className="mt-8 w-full overflow-hidden rounded-2xl border border-white/15 bg-card text-left shadow-2xl">
              <div className="border-b border-border bg-muted/50 px-6 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Zero2Brands certificate of completion
                </p>
              </div>
              <div className="px-6 py-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Awarded to
                </p>
                <p className="mt-1.5 text-balance text-2xl font-semibold text-foreground">
                  {cert.profiles?.full_name}
                </p>

                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  For completing
                </p>
                <p className="mt-1.5 text-balance text-base font-medium text-foreground">
                  {cert.courses?.title}
                </p>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-border pt-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Issued
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Certificate no.
                    </p>
                    <p className="mt-1 font-mono text-xs text-foreground">
                      {cert.certificate_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.26}>
            <p className="mt-6 text-sm text-white/60">
              Verified live against the Zero2Brands records.
            </p>
            <Link
              href="/course"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-6 text-sm text-white transition-colors duration-200 hover:bg-white/10"
            >
              About the course
            </Link>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <Reveal>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-7" strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 text-balance text-2xl font-semibold sm:text-3xl">
          Certificate not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-balance leading-relaxed text-muted-foreground">
          This certificate number could not be verified. Check the number and
          try again.
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          {certificateNumber}
        </p>
      </Reveal>
    </div>
  );
}
