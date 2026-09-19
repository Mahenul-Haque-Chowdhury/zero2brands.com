"use client";

import { cloneElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

/**
 * Admin sidebar nav item with a current-page state.
 *
 * The layout is an async server component (requireStaff), so the active
 * check lives in this small client leaf rather than pushing the whole
 * layout client-side. `/management` is matched exactly so it does not stay
 * highlighted on every nested route.
 *
 * `icon` is a pre-rendered element (`<LayoutDashboard />`), not a component
 * reference. A lucide icon *component* can't cross the server-to-client
 * boundary as a prop (only serializable data and already-rendered elements
 * can), so the server layout renders the icon and hands this a finished
 * node to re-style with the active-state classes.
 */
export function AdminNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    (href !== "/management" && pathname?.startsWith(href + "/"));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
        active
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 w-0.5 -translate-y-1/2 rounded-r-full bg-accent",
          active ? "h-4 opacity-100" : "h-0 opacity-0"
        )}
      />
      {cloneElement(icon, {
        className: cn(
          "size-3.5 shrink-0 transition-colors duration-150",
          active ? "text-accent" : "text-sidebar-foreground/50"
        ),
      })}
      {label}
    </Link>
  );
}
