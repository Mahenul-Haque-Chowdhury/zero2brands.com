"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

const NAV = [
  { href: "/course", label: "Course" },
  { href: "/batches", label: "Batches" },
  { href: "/build-your-store", label: "Build Your Store" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-primary"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            Z2B
          </span>
          <span className="hidden sm:inline">Zero2Brands</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" render={<Link href="/login">Log in</Link>} />
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            render={<Link href="/course">Enroll now</Link>}
          />
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              render={<Link href="/login">Log in</Link>}
            />
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href="/course">Enroll now</Link>}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
