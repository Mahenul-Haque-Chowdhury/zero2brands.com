import { createAdminClient } from "@/lib/supabase/admin";
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-2xl font-semibold">No payment found</h1>
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-muted-foreground">
          Invoice {invoice}. Your access is active — head to your dashboard.
        </p>
        <a href="/dashboard" className="underline">
          Go to dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Confirming your payment…</h1>
      <p className="text-muted-foreground">
        This can take a minute. Please don&apos;t close this page.
      </p>
      <SuccessPagePoller invoice={invoice} />
    </div>
  );
}
