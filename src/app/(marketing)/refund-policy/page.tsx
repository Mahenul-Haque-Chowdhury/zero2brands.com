import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <span className="text-xs font-semibold uppercase tracking-wide text-accent">
        Legal
      </span>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Refund Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Draft, pending final review by the business owner (specific refund
        window and any conditions). Last updated{" "}
        {new Date().toLocaleDateString()}.
      </p>
      <hr className="mt-8 border-border" />

      <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-muted-foreground prose-headings:font-heading prose-headings:text-foreground prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-lg prose-p:leading-relaxed prose-strong:text-foreground">
        <p>
          [Placeholder, owner to confirm the exact refund window, e.g. 7
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
