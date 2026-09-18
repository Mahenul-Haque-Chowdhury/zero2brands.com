export const metadata = { title: "Payment cancelled" };

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Payment cancelled</h1>
      <p className="text-muted-foreground">
        You cancelled the payment. No charge was made.
      </p>
      <a href="/course" className="underline">
        Back to the course
      </a>
    </div>
  );
}
