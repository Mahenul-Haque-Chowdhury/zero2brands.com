import { requireOnboarded } from "@/lib/auth/guards";
import { StoreRequestForm } from "./store-request-form";

export const metadata = { title: "Build Your Store" };

export default async function StoreRequestPage() {
  const { profile } = await requireOnboarded();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Build Your Store</h1>
        <p className="mt-1 text-muted-foreground">
          Tell GrayVally a bit about your business and they&apos;ll be in touch.
        </p>
      </div>
      <StoreRequestForm profile={profile} />
    </div>
  );
}
