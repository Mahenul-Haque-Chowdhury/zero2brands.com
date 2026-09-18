import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <h1 className="text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Draft, pending final review by the business owner. Last updated{" "}
        {new Date().toLocaleDateString()}.
      </p>

      <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-muted-foreground prose-headings:font-heading prose-headings:text-foreground">
        <h2>What we collect</h2>
        <p>
          When you create an account we collect your name, email address,
          phone number, and (optionally) district, business name and a
          short bio. When you make a payment, we store payment records
          including the transaction reference from our payment provider,
          but never your full payment card or mobile wallet PIN.
        </p>

        <h2>Other students can see some of your information</h2>
        <p>
          Zero2Brands includes a student community. Depending on the
          visibility setting you choose (public, students only, or
          private), other enrolled students may be able to see your name,
          district, business name and business category in a directory and
          on your profile page. Your email address and phone number are
          never shown to other students under any setting. You can change
          your visibility setting at any time from your account settings.
        </p>

        <h2>How video access works</h2>
        <p>
          Course videos are protected with time-limited, signed access
          links tied to your account and device session. Do not share
          these links, they expire automatically after a few hours and
          are logged against your account.
        </p>

        <h2>Device limit</h2>
        <p>
          Your account may be signed in on up to two devices at a time.
          Signing in on a third device will sign out your oldest active
          session.
        </p>

        <h2>Content sharing prohibition</h2>
        <p>
          Sharing your account, login credentials, or course content
          (including video links, downloads, or recordings) with anyone
          outside your own account is a violation of our Terms of Service
          and may result in immediate suspension of your access without a
          refund.
        </p>

        <h2>Data retention and third parties</h2>
        <p>
          We use Supabase for our database and authentication, Bunny.net
          for video hosting, bKash for payment processing, Resend for
          email delivery, and a local SMS gateway for text messages. Each
          of these providers processes only the data necessary to perform
          their function for us.
        </p>

        <h2>Your rights</h2>
        <p>
          You can request a copy of your data or ask us to delete your
          account by contacting support@zero2brands.com.
        </p>

        <h2>Contact</h2>
        <p>
          Zero2Brands &middot; support@zero2brands.com
          <br />
          Pubail, Gazipur, Dhaka, Bangladesh
        </p>
      </div>
    </div>
  );
}
