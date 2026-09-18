import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment failed" };

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <AlertCircle className="size-7" />
      </span>
      <h1 className="text-2xl font-semibold">Payment failed</h1>
      <p className="max-w-sm text-muted-foreground">
        Something went wrong and your payment could not be completed. No
        amount should have been deducted. If it was, contact support and
        we will resolve it.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" render={<Link href="/course">Try again</Link>} />
        <Button variant="outline" render={<Link href="/contact">Contact support</Link>} />
      </div>
    </div>
  );
}
