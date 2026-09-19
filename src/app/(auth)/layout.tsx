import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/shared/wordmark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/50">
      <div className="flex items-center justify-center bg-primary px-4 py-8">
        <Link href="/" className="flex items-center" aria-label="Zero2Brands home">
          <Wordmark size="lg" />
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8">
          {children}
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Zero2Brands. All rights reserved.
        </p>
      </div>
    </div>
  );
}
