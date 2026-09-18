import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <h1 className="text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Draft, pending final review by the business owner. Last updated{" "}
        {new Date().toLocaleDateString()}.
      </p>

      <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-muted-foreground prose-headings:font-heading prose-headings:text-foreground">
        <h2>1. The product</h2>
        <p>
          Zero2Brands sells access to a recorded course (lifetime access, no
          expiry) and separately, seat-limited live batch cohorts with
          scheduled sessions over a fixed period. A single account may hold
          either or both.
        </p>

        <h2>2. Account sharing and content redistribution</h2>
        <p>
          Your account is for your personal use only. Sharing your login,
          course videos, downloadable resources, or any other course
          content with anyone who has not purchased access is strictly
          prohibited.{" "}
          <strong>
            Violating this ends your access immediately, without a refund.
          </strong>{" "}
          We use signed, time-limited access tokens and a two-device
          concurrent session limit to protect the course, and access
          activity is logged.
        </p>

        <h2>3. The student community</h2>
        <p>
          By enrolling, you join a directory visible to other paying
          students. Depending on your visibility setting, other students
          may see your name, district and business name. You can change
          this in your account settings.
        </p>

        <h2>4. Payments</h2>
        <p>
          Payments are processed through bKash. Prices are shown in
          Bangladeshi Taka (BDT) and include all taxes unless stated
          otherwise. See our Refund Policy for cancellation and refund
          terms.
        </p>

        <h2>5. Live batches</h2>
        <p>
          Live batches have a fixed seat limit, schedule and price. Session
          recordings are added afterward and are visible only to students
          enrolled in that batch.
        </p>

        <h2>6. Disputes</h2>
        <p>
          Contact support@zero2brands.com first for any dispute. We aim to
          resolve issues directly before any other action is necessary.
        </p>

        <h2>7. Contact</h2>
        <p>Zero2Brands &middot; support@zero2brands.com</p>
      </div>
    </div>
  );
}
