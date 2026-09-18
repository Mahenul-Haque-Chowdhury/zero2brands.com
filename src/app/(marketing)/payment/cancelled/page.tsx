import Link from "next/link";
import { CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const metadata = { title: "Payment cancelled" };

/**
 * Cancelling is a normal, intentional choice, so this stays neutral and
 * low-drama: confirm nothing was charged, offer the way back.
 */
export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Reveal>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleSlash className="size-7" strokeWidth={1.75} />
        </span>
      </Reveal>

      <Reveal delay={0.12}>
        <h1 className="mt-6 text-balance text-2xl font-semibold sm:text-3xl">
          Payment cancelled
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance leading-relaxed text-muted-foreground">
          You cancelled the payment and no charge was made. You can pick up
          where you left off whenever you are ready.
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 bg-accent px-8 text-base font-medium text-accent-foreground transition-transform duration-200 hover:bg-accent/90 active:scale-[0.98]"
            render={<Link href="/course">Back to the course</Link>}
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
