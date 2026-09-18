import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-5">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border p-2">
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-2.5">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
