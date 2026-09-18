import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-sm md:grid-cols-4">
        <div>
          <p className="font-semibold">Zero2Brands</p>
          <p className="mt-2 text-muted-foreground">
            Build a clothing brand, from zero.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/course" className="text-muted-foreground hover:text-foreground">Course</Link>
          <Link href="/batches" className="text-muted-foreground hover:text-foreground">Batches</Link>
          <Link href="/build-your-store" className="text-muted-foreground hover:text-foreground">Build Your Store</Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
          <Link href="/refund-policy" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Zero2Brands. All rights reserved.
      </p>
    </footer>
  );
}
