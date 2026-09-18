import { requireStaff } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfToday as getStartOfToday, daysAgo, minutesAgo } from "@/lib/utils/dates";

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
      <h1 className="mb-6 text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={stat.alert ? "border-destructive" : undefined}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-normal text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${stat.alert ? "text-destructive" : ""}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
