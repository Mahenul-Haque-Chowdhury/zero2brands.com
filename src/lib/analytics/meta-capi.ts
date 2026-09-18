import "server-only";
import { createHash } from "node:crypto";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientEnv } from "@/lib/env.client";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface CapiEventParams {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  email?: string;
  phoneE164?: string;
  firstName?: string;
  ipAddress?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  customData?: Record<string, unknown>;
}

async function sendCapiEvent(params: CapiEventParams): Promise<void> {
  if (!serverEnv.META_CAPI_ACCESS_TOKEN || !clientEnv.NEXT_PUBLIC_META_PIXEL_ID) {
    return; // Not configured yet — Phase 0.10 is an owner task.
  }

  const userData: Record<string, unknown> = {};
  if (params.email) userData.em = [sha256(params.email)];
  if (params.phoneE164) userData.ph = [sha256(params.phoneE164)];
  if (params.firstName) userData.fn = [sha256(params.firstName)];
  if (params.ipAddress) userData.client_ip_address = params.ipAddress;
  if (params.userAgent) userData.client_user_agent = params.userAgent;
  if (params.fbp) userData.fbp = params.fbp;
  if (params.fbc) userData.fbc = params.fbc;
  userData.country = [sha256("bd")];

  const body = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: params.customData ?? {},
      },
    ],
    ...(serverEnv.META_TEST_EVENT_CODE
      ? { test_event_code: serverEnv.META_TEST_EVENT_CODE }
      : {}),
  };

  await fetch(
    `https://graph.facebook.com/v21.0/${clientEnv.NEXT_PUBLIC_META_PIXEL_ID}/events?access_token=${serverEnv.META_CAPI_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  ).catch(() => {
    // Analytics failures must never affect the payment/grant flow.
  });
}

/**
 * Fires the server-side Purchase event using the SAME event_id the browser
 * used for InitiateCheckout/Purchase, so Meta deduplicates correctly. Must
 * be called both from the grant path (Phase 4.5) AND from the
 * reconciliation job (Phase 4.7) — a payment recovered by polling is
 * otherwise invisible to Meta.
 */
export async function fireServerPurchaseEvent(params: {
  paymentId: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select(
      "id, amount_bdt, user_id, merchant_invoice_number, ip_address, user_agent, profiles:user_id(email, phone, full_name)"
    )
    .eq("id", params.paymentId)
    .maybeSingle<{
      id: string;
      amount_bdt: number;
      user_id: string;
      merchant_invoice_number: string;
      ip_address: string | null;
      user_agent: string | null;
      profiles: { email: string; phone: string | null; full_name: string | null } | null;
    }>();

  if (!payment) return;

  await sendCapiEvent({
    eventName: "Purchase",
    // Using the invoice number as a stable dedup key with the browser
    // event requires the browser to pass the same id — wired in Phase 12.
    eventId: payment.merchant_invoice_number,
    eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/payment/success`,
    email: payment.profiles?.email,
    phoneE164: payment.profiles?.phone
      ? `880${payment.profiles.phone.replace(/^0/, "")}`
      : undefined,
    firstName: payment.profiles?.full_name?.split(" ")[0],
    ipAddress: payment.ip_address ?? undefined,
    userAgent: payment.user_agent ?? undefined,
    customData: {
      currency: "BDT",
      value: payment.amount_bdt,
    },
  });
}
