import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/marketing/json-ld";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const admin = createAdminClient();
  const { data: faqs } = await admin
    .from("faqs")
    .select("question, answer")
    .eq("is_published", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (faqs ?? []).map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Support
      </p>
      <h1 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-muted-foreground">
        Can&apos;t find what you&apos;re looking for? Reach out on our
        contact page.
      </p>

      {faqs && faqs.length > 0 ? (
        <Accordion multiple={false} className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-medium">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-muted-foreground">
            Questions are being added soon.
          </p>
        </div>
      )}
    </div>
  );
}
