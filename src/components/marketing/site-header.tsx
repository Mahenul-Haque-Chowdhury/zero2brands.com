import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/course", label: "Course" },
  { href: "/batches", label: "Batches" },
  { href: "/build-your-store", label: "Build Your Store" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Zero2Brands
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/login">Log in</Link>}
          />
          <Button size="sm" render={<Link href="/course">Enroll now</Link>} />
        </div>
      </div>
    </header>
  );
}
