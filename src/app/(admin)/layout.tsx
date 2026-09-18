import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  FileVideo,
  Users2,
  GraduationCap,
  CreditCard,
  BarChart3,
  UserPlus,
  Store,
  Tag,
  Newspaper,
  Settings,
} from "lucide-react";
import { requireStaff } from "@/lib/auth/guards";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/lessons", label: "Lessons", icon: FileVideo },
  { href: "/admin/batches", label: "Batches", icon: Users2 },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/store-requests", label: "Store requests", icon: Store },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();

  return (
    <div className="flex min-h-screen bg-secondary/30 text-[0.8125rem]">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
        <Link
          href="/admin"
          className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 text-sm font-semibold tracking-tight"
        >
          <span className="flex size-6 items-center justify-center rounded bg-sidebar-primary text-[0.65rem] font-bold text-sidebar-primary-foreground">
            Z2B
          </span>
          Admin
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Icon className="size-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {profile?.full_name}
            </span>{" "}
            &middot; {profile?.role}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
