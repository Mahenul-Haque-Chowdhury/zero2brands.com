export const metadata = { title: "Payment failed" };

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Payment failed</h1>
      <p className="text-muted-foreground">
        Something went wrong and your payment could not be completed. No
        amount should have been deducted; if it was, contact support and we
        will resolve it.
      </p>
      <a href="/course" className="underline">
        Try again
      </a>
    </div>
  );
}
