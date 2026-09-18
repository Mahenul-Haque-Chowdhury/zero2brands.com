import Link from "next/link";
import { CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment cancelled" };

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CircleSlash className="size-7" />
      </span>
      <h1 className="text-2xl font-semibold">Payment cancelled</h1>
      <p className="max-w-sm text-muted-foreground">
        You cancelled the payment. No charge was made.
      </p>
      <Button className="bg-accent text-accent-foreground hover:bg-accent/90" render={<Link href="/course">Back to the course</Link>} />
    </div>
  );
}
