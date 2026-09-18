/** bKash Tokenized Checkout API types (v1.2.0-beta). */

export interface BkashGrantTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number; // seconds
  refresh_token: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashRefreshTokenResponse extends BkashGrantTokenResponse {}

export interface BkashCreatePaymentRequest {
  mode: "0011";
  payerReference: string;
  callbackURL: string;
  amount: string; // two decimals, e.g. "4999.00"
  currency: "BDT";
  intent: "sale";
  merchantInvoiceNumber: string;
}

export interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashExecutePaymentResponse {
  paymentID: string;
  createTime: string;
  updateTime: string;
  trxID: string;
  transactionStatus: "Completed" | "Initiated" | "Failed" | string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  payerReference: string;
  customerMsisdn: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashQueryPaymentResponse {
  paymentID: string;
  mode: string;
  paymentCreateTime: string;
  paymentExecuteTime?: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  transactionStatus: string;
  trxID?: string;
  customerMsisdn?: string;
  payerReference?: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashRefundRequest {
  paymentID: string;
  trxID: string;
  amount: string;
  sku?: string;
  reason?: string;
}

export interface BkashRefundResponse {
  completedTime: string;
  originalTrxID: string;
  refundTrxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  charge: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashRefundStatusResponse {
  originalTrxID: string;
  refundTrxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  completedTime?: string;
  statusCode: string;
  statusMessage: string;
}

export type BkashCallbackStatus = "success" | "failure" | "cancel";
