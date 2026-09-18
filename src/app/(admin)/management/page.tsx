import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfToday as getStartOfToday, daysAgo, minutesAgo } from "@/lib/utils/dates";
import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/admin/data-table";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const { supabase } = await requireStaff();

  const startOfToday = getStartOfToday();
  const startOfWeek = daysAgo(7);
  const startOfMonth = daysAgo(30);

  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    newEnrollments,
    stuckPayments,
    newLeads,
    newStoreRequests,
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount_bdt")
      .eq("status", "completed")
      .gte("paid_at", startOfToday.toISOString()),
    supabase
      .from("payments")
      .select("amount_bdt")
      .eq("status", "completed")
      .gte("paid_at", startOfWeek.toISOString()),
    supabase
      .from("payments")
      .select("amount_bdt")
      .eq("status", "completed")
      .gte("paid_at", startOfMonth.toISOString()),
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .gte("granted_at", startOfWeek.toISOString()),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing")
      .lt(
        "created_at",
        minutesAgo(10).toISOString()
      ),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfWeek.toISOString()),
    supabase
      .from("store_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const sum = (rows: { amount_bdt: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + r.amount_bdt, 0);

  const stuckCount = stuckPayments.count ?? 0;

  const stats = [
    { label: "Revenue today", value: `৳${sum(revenueToday.data).toLocaleString()}` },
    { label: "Revenue this week", value: `৳${sum(revenueWeek.data).toLocaleString()}` },
    { label: "Revenue this month", value: `৳${sum(revenueMonth.data).toLocaleString()}` },
    { label: "New enrollments (7d)", value: newEnrollments.count ?? 0 },
    { label: "New leads (7d)", value: newLeads.count ?? 0 },
    { label: "New store requests", value: newStoreRequests.count ?? 0 },
  ];

  return (
    <div>
      <PageHeading
        title="Overview"
        description="Key numbers across revenue, enrollments, and pending work."
      />

      {/* Stuck payments is the most operationally urgent number in the app,
          so it gets its own full-width banner above the tiles: loud and
          actionable when non-zero, quiet and reassuring when zero. */}
      {stuckCount > 0 ? (
        <Link
          href="/management/reports"
          className="group mb-4 flex items-center gap-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3.5 transition-colors duration-150 hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-destructive">
              {stuckCount} payment{stuckCount === 1 ? "" : "s"} stuck in
              processing
            </p>
            <p className="text-xs text-destructive/80">
              Older than 10 minutes and not reconciled. Review these now.
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-destructive sm:inline-flex">
            Reconcile
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-accent" />
          No payments stuck in processing.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center justify-between gap-2 font-sans text-xs font-medium text-muted-foreground">
                <span className="truncate">{stat.label}</span>
                <TrendingUp className="size-3.5 shrink-0 text-muted-foreground/40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
