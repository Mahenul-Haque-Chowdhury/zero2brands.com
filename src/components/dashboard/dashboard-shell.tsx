"use client";

import Link from "next/link";
import { useSessionHeartbeat } from "@/hooks/use-session-heartbeat";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/course", label: "Course" },
  { href: "/dashboard/my-batches", label: "My Batches" },
  { href: "/dashboard/community", label: "Community" },
  { href: "/dashboard/resources", label: "Resources" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile | null;
  children: React.ReactNode;
}) {
  useSessionHeartbeat();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Zero2Brands
        </Link>
        <nav className="hidden gap-4 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {profile?.full_name ?? profile?.email}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
