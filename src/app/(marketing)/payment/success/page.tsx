import Link from "next/link";
import { CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HelpCircle className="size-7" />
        </span>
        <h1 className="text-2xl font-semibold">No payment found</h1>
        <Button variant="outline" render={<Link href="/course">Back to the course</Link>} />
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="max-w-sm text-muted-foreground">
          Invoice {invoice}. Your access is active, head to your dashboard.
        </p>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          render={<Link href="/dashboard">Go to dashboard</Link>}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Loader2 className="size-7 animate-spin" />
      </span>
      <h1 className="text-2xl font-semibold">Confirming your payment...</h1>
      <p className="max-w-sm text-muted-foreground">
        This can take a minute. Please don&apos;t close this page.
      </p>
      <SuccessPagePoller invoice={invoice} />
    </div>
  );
}
