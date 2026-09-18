import Link from "next/link";

const COLUMNS = [
  {
    heading: "Learn",
    links: [
      { href: "/course", label: "Course" },
      { href: "/batches", label: "Batches" },
      { href: "/build-your-store", label: "Build Your Store" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-primary"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                Z2B
              </span>
              Zero2Brands
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A practical, step-by-step course and community for starting and
              growing a clothing business in Bangladesh.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">
                {col.heading}
              </p>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Zero2Brands. All rights
            reserved.
          </p>
          <p>Dhaka, Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
