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
    <div className="mx-auto max-w-2xl px-4 py-16">
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
      <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
      <Accordion multiple={false} className="mt-8">
        {(faqs ?? []).map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>{f.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
