import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Draft — pending final review by the business owner (specific refund
        window and any conditions). Last updated {new Date().toLocaleDateString()}.
      </p>

      <div className="prose mt-8 max-w-none text-sm">
        <p>
          [Placeholder — owner to confirm the exact refund window, e.g. 7
          days from purchase, and whether it applies differently to the
          recorded course versus live batches.]
        </p>
        <p>
          Refunds are not available once evidence of account sharing or
          content redistribution is found, regardless of the refund
          window.
        </p>
        <p>
          To request a refund, contact support@zero2brands.com with your
          invoice number.
        </p>
      </div>
    </div>
  );
}
