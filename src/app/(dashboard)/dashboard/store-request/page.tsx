import { requireOnboarded } from "@/lib/auth/guards";
import { StoreRequestForm } from "./store-request-form";

export const metadata = { title: "Build Your Store" };

export default async function StoreRequestPage() {
  const { profile } = await requireOnboarded();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-semibold">Build Your Store</h1>
      <p className="mb-6 text-muted-foreground">
        Tell GrayVally a bit about your business and they&apos;ll be in touch.
      </p>
      <StoreRequestForm profile={profile} />
    </div>
  );
}
