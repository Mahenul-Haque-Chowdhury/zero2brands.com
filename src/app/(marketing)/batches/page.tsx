import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Live Batches" };

export default async function BatchesPage() {
  const admin = createAdminClient();
  const { data: batches } = await admin
    .from("batches")
    .select("slug, title, price_bdt, seat_limit, seats_taken, starts_at, status")
    .neq("status", "cancelled")
    .order("starts_at");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Live Batches</h1>
      <p className="mt-2 text-muted-foreground">
        Seat-limited cohorts with scheduled live sessions, sold separately
        from the recorded course.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(batches ?? []).map((b) => {
          const seatsLeft = b.seat_limit - b.seats_taken;
          return (
            <Link key={b.slug} href={`/batches/${b.slug}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{b.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm">
                  <p>৳{b.price_bdt.toLocaleString()}</p>
                  <p className="text-muted-foreground">
                    Starts {new Date(b.starts_at).toLocaleDateString()}
                  </p>
                  <Badge variant={seatsLeft > 0 ? "default" : "destructive"}>
                    {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {(!batches || batches.length === 0) && (
          <p className="text-muted-foreground">No batches open right now.</p>
        )}
      </div>
    </div>
  );
}
