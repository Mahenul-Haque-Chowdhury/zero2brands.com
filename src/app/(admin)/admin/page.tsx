import { requireStaff } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfToday as getStartOfToday, daysAgo, minutesAgo } from "@/lib/utils/dates";
import { TrendingUp, AlertTriangle } from "lucide-react";

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

  const stats = [
    { label: "Revenue today", value: `৳${sum(revenueToday.data).toLocaleString()}` },
    { label: "Revenue this week", value: `৳${sum(revenueWeek.data).toLocaleString()}` },
    { label: "Revenue this month", value: `৳${sum(revenueMonth.data).toLocaleString()}` },
    { label: "New enrollments (7d)", value: newEnrollments.count ?? 0 },
    {
      label: "Payments stuck processing",
      value: stuckPayments.count ?? 0,
      alert: (stuckPayments.count ?? 0) > 0,
    },
    { label: "New leads (7d)", value: newLeads.count ?? 0 },
    { label: "New store requests", value: newStoreRequests.count ?? 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Key numbers across revenue, enrollments, and pending work.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            size="sm"
            className={
              stat.alert
                ? "ring-1 ring-destructive/30 bg-destructive/5"
                : undefined
            }
          >
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center justify-between font-sans text-xs font-medium text-muted-foreground">
                {stat.label}
                {stat.alert ? (
                  <AlertTriangle className="size-3.5 text-destructive" />
                ) : (
                  <TrendingUp className="size-3.5 text-muted-foreground/50" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-semibold tabular-nums ${
                  stat.alert ? "text-destructive" : "text-foreground"
                }`}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
