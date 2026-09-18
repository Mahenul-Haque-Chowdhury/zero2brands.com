import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center" aria-label="Zero2Brands home">
        <Wordmark size="lg" />
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Zero2Brands. All rights reserved.
      </p>
    </div>
  );
}
