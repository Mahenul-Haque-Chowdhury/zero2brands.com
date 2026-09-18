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
import { Wordmark } from "@/components/shared/wordmark";

const NAV_ITEMS = [
  { href: "/management", label: "Overview", icon: LayoutDashboard },
  { href: "/management/courses", label: "Courses", icon: BookOpen },
  { href: "/management/lessons", label: "Lessons", icon: FileVideo },
  { href: "/management/batches", label: "Batches", icon: Users2 },
  { href: "/management/students", label: "Students", icon: GraduationCap },
  { href: "/management/payments", label: "Payments", icon: CreditCard },
  { href: "/management/reports", label: "Reports", icon: BarChart3 },
  { href: "/management/leads", label: "Leads", icon: UserPlus },
  { href: "/management/store-requests", label: "Store requests", icon: Store },
  { href: "/management/coupons", label: "Coupons", icon: Tag },
  { href: "/management/blog", label: "Blog", icon: Newspaper },
  { href: "/management/settings", label: "Settings", icon: Settings },
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
          href="/management"
          className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4"
          aria-label="Zero2Brands admin home"
        >
          <Wordmark size="sm" tagline="Admin" />
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
