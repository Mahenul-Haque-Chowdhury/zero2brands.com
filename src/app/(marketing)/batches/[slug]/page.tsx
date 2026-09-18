import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BuyButton } from "@/components/marketing/buy-button";
import { Badge } from "@/components/ui/badge";
import { nowMs } from "@/lib/utils/dates";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: batch } = await admin
    .from("batches")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!batch || batch.status === "cancelled") notFound();

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("batch_id", batch.id)
    .eq("type", "batch")
    .maybeSingle();

  const seatsLeft = batch.seat_limit - batch.seats_taken;
  const now = nowMs();
  const opensAt = batch.enrollment_opens_at ? new Date(batch.enrollment_opens_at).getTime() : 0;
  const closesAt = batch.enrollment_closes_at
    ? new Date(batch.enrollment_closes_at).getTime()
    : Infinity;

  let state: "not_open" | "open" | "full" | "closed" = "open";
  if (now < opensAt) state = "not_open";
  else if (seatsLeft <= 0) state = "full";
  else if (now > closesAt) state = "closed";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">{batch.title}</h1>
      <p className="mt-2 text-muted-foreground">{batch.description}</p>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-2xl font-semibold">৳{batch.price_bdt.toLocaleString()}</span>
        {batch.compare_at_price_bdt ? (
          <span className="text-muted-foreground line-through">
            ৳{batch.compare_at_price_bdt.toLocaleString()}
          </span>
        ) : null}
      </div>

      {batch.includes_course_access ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Includes lifetime access to the recorded course.
        </p>
      ) : null}

      <p className="mt-2 text-sm text-muted-foreground">{batch.schedule_note}</p>

      <div className="mt-4">
        <Badge variant={seatsLeft > 0 ? "default" : "destructive"}>
          {seatsLeft > 0 ? `${seatsLeft} of ${batch.seat_limit} seats left` : "Full"}
        </Badge>
      </div>

      <div className="mt-8">
        {state === "open" && product ? (
          <BuyButton productId={product.id} />
        ) : state === "not_open" ? (
          <p className="text-sm text-muted-foreground">
            Enrollment opens {new Date(batch.enrollment_opens_at!).toLocaleDateString()}.
          </p>
        ) : state === "full" ? (
          <p className="text-sm text-muted-foreground">This batch is full.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Enrollment has closed.</p>
        )}
      </div>
    </div>
  );
}
