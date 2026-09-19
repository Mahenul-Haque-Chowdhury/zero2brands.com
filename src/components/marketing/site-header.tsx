"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/shared/wordmark";
import { cn } from "cn";

const NAV = [
  { href: "/course", label: "Course" },
  { href: "/batches", label: "Batches" },
  { href: "/build-your-store", label: "Build Your Store" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-primary">
      <div className="mx-auto flex h-20 max-w-360 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Zero2Brands home">
          <Wordmark size="md" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-base font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button
              size="lg"
              className="h-11 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
              render={<Link href="/dashboard">Go to dashboard</Link>}
            />
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-base text-white hover:bg-white/10 hover:text-white"
                render={<Link href="/login">Log in</Link>}
              />
              <Button
                size="lg"
                className="h-11 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
                render={<Link href="/course">Enroll now</Link>}
              />
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-md text-white md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-primary px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                render={
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    Go to dashboard
                  </Link>
                }
              />
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                  render={
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  }
                />
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  render={
                    <Link href="/course" onClick={() => setOpen(false)}>
                      Enroll now
                    </Link>
                  }
                />
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
