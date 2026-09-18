import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Polled by the success page every 3 seconds (up to 90s) while a payment
 * is still `processing`. Grants nothing itself — it only reports state.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const invoice = request.nextUrl.searchParams.get("invoice");
  if (!invoice) {
    return NextResponse.json({ error: "missing invoice" }, { status: 400 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("status, merchant_invoice_number")
    .eq("merchant_invoice_number", invoice)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ status: payment.status });
}
