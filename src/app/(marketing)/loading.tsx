import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared skeleton for marketing route transitions. Before this existed the
 * marketing section had no loading.tsx at all, so every navigation between
 * database-backed pages showed nothing until the server responded.
 *
 * Shaped to the common marketing layout (eyebrow, heading, lead paragraph,
 * then a card grid) so the swap to real content does not jump.
 */
export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
