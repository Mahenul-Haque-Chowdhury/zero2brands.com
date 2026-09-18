import Link from "next/link";
import { CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SuccessPagePoller } from "./poller";

export const metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string; pending?: string }>;
}) {
  const params = await searchParams;
  const invoice = params.invoice;

  if (!invoice) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
        <Reveal>
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <HelpCircle className="size-7" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold">No payment found</h1>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            We could not find a payment to show here. If you just paid, check
            your email for the confirmation.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              render={<Link href="/course">Back to the course</Link>}
            />
          </div>
        </Reveal>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("status, amount_bdt")
    .eq("merchant_invoice_number", invoice)
    .maybeSingle();

  if (payment?.status === "completed") {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        {/* Soft green halo behind the check: the one moment on the site that
            earns a celebratory treatment. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_35%,rgba(0,200,83,0.12)_0%,transparent_70%)]"
        />
        <div className="relative">
          <Reveal>
            <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent/15 text-accent ring-8 ring-accent/5">
              <CheckCircle2 className="size-10" strokeWidth={1.75} />
            </span>
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="mt-7 text-balance text-3xl font-semibold sm:text-4xl">
              Payment successful
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-balance text-muted-foreground">
              You&apos;re in. Your access is active and waiting in your
              dashboard.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mx-auto mt-8 w-full max-w-xs rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Invoice
                </span>
                <span className="font-mono text-xs text-foreground">
                  {invoice}
                </span>
              </div>
              {payment.amount_bdt ? (
                <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    ৳{payment.amount_bdt.toLocaleString()}
                  </span>
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                className="h-12 bg-accent px-8 text-base font-medium text-accent-foreground transition-transform duration-200 hover:bg-accent/90 active:scale-[0.98]"
                render={<Link href="/dashboard">Go to dashboard</Link>}
              />
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Reveal>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </span>
        <h1 className="mt-6 text-balance text-2xl font-semibold sm:text-3xl">
          Confirming your payment...
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-balance text-muted-foreground">
          This can take a minute. Please don&apos;t close this page.
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Invoice {invoice}
        </p>
      </Reveal>
      <SuccessPagePoller invoice={invoice} />
    </div>
  );
}
