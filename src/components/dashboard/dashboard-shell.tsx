"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users2,
  MessagesSquare,
  FolderOpen,
  Award,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useSessionHeartbeat } from "@/hooks/use-session-heartbeat";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { RegistrationTracker } from "@/components/shared/registration-tracker";
import { Wordmark } from "@/components/shared/wordmark";
import { cn } from "cn";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/course", label: "Course", icon: BookOpen },
  { href: "/dashboard/my-batches", label: "My Batches", icon: Users2 },
  { href: "/dashboard/community", label: "Community", icon: MessagesSquare },
  { href: "/dashboard/resources", label: "Resources", icon: FolderOpen },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "";
  if (!source) return "U";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              active
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            {/* Accent rail marks the current page without flooding the
                sidebar with the one accent colour. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-1/2 w-0.5 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-200 ease-out",
                active ? "h-5 opacity-100" : "h-0 opacity-0"
              )}
            />
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors duration-200",
                active
                  ? "text-accent"
                  : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile | null;
  children: React.ReactNode;
}) {
  useSessionHeartbeat();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {profile ? <RegistrationTracker userId={profile.id} /> : null}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link href="/dashboard" className="flex items-center" aria-label="Zero2Brands home">
            <Wordmark size="sm" />
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-3 py-2">
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent ring-1 ring-accent/25">
              {initials(profile?.full_name, profile?.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {profile?.full_name ?? "Student"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {profile?.email}
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="mt-1 w-full justify-start gap-2 text-sidebar-foreground/70 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:hidden">
          <Link href="/dashboard" className="flex items-center" aria-label="Zero2Brands home">
            <Wordmark size="sm" />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-md text-sidebar-foreground transition-colors duration-200 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {mobileOpen ? (
          <div className="flex animate-in slide-in-from-top-2 flex-col gap-1 border-b border-sidebar-border bg-sidebar px-3 py-3 text-sidebar-foreground duration-200 md:hidden">
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <form action={logoutAction} className="mt-2 border-t border-sidebar-border pt-3">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sidebar-foreground/70 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="size-4" />
                Log out
              </Button>
            </form>
          </div>
        ) : null}

        <main className="flex-1 bg-secondary/40 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
