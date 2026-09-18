import "server-only";
import { bkashAuthedFetch } from "@/lib/bkash/http";
import { serverEnv } from "@/lib/env";
import type {
  BkashCreatePaymentResponse,
  BkashExecutePaymentResponse,
  BkashQueryPaymentResponse,
  BkashRefundRequest,
  BkashRefundResponse,
  BkashRefundStatusResponse,
} from "@/lib/bkash/types";

export async function createBkashPayment(params: {
  payerReference: string;
  amountBdt: number;
  merchantInvoiceNumber: string;
}): Promise<BkashCreatePaymentResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return bkashAuthedFetch<BkashCreatePaymentResponse>("/create", {
    method: "POST",
    body: {
      mode: "0011",
      payerReference: params.payerReference,
      callbackURL: `${siteUrl}/api/payments/bkash/callback`,
      amount: params.amountBdt.toFixed(2),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: params.merchantInvoiceNumber,
    },
  });
}

export async function executeBkashPayment(
  paymentID: string
): Promise<BkashExecutePaymentResponse> {
  return bkashAuthedFetch<BkashExecutePaymentResponse>("/execute", {
    method: "POST",
    body: { paymentID },
  });
}

export async function queryBkashPayment(
  paymentID: string
): Promise<BkashQueryPaymentResponse> {
  return bkashAuthedFetch<BkashQueryPaymentResponse>("/payment/status", {
    method: "POST",
    body: { paymentID },
  });
}

export async function refundBkashPayment(
  params: BkashRefundRequest
): Promise<BkashRefundResponse> {
  return bkashAuthedFetch<BkashRefundResponse>("/payment/refund", {
    method: "POST",
    body: params,
  });
}

export async function queryBkashRefundStatus(params: {
  paymentID: string;
  trxID: string;
}): Promise<BkashRefundStatusResponse> {
  return bkashAuthedFetch<BkashRefundStatusResponse>("/refund/status", {
    method: "POST",
    body: params,
  });
}

export function isBkashSandbox(): boolean {
  return serverEnv.BKASH_IS_SANDBOX;
}
