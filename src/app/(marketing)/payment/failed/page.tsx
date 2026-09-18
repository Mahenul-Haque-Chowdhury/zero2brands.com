import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const metadata = { title: "Payment failed" };

/**
 * Deliberately calm: a failed payment is recoverable, so this reads as a
 * neutral "try again" rather than an alarming error state. No destructive
 * red, no warning iconography.
 */
export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Reveal>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <RefreshCw className="size-7" strokeWidth={1.75} />
        </span>
      </Reveal>

      <Reveal delay={0.12}>
        <h1 className="mt-6 text-balance text-2xl font-semibold sm:text-3xl">
          Payment did not go through
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance leading-relaxed text-muted-foreground">
          Something went wrong and your payment could not be completed. No
          amount should have been deducted. If it was, contact support and we
          will resolve it.
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 bg-accent px-8 text-base font-medium text-accent-foreground transition-transform duration-200 hover:bg-accent/90 active:scale-[0.98]"
            render={<Link href="/course">Try again</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
            render={<Link href="/contact">Contact support</Link>}
          />
        </div>
      </Reveal>
    </div>
  );
}
