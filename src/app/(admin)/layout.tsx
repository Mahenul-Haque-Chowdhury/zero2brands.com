import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/store-requests", label: "Store requests" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r p-4 md:block">
        <Link href="/admin" className="mb-6 block font-semibold">
          Zero2Brands Admin
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {profile?.full_name} · {profile?.role}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
