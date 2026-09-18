import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoading() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="w-full shrink-0 rounded-xl border border-border bg-card p-3 md:w-72">
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex-1 rounded-xl border border-border bg-card p-6 sm:p-8">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-6 aspect-video w-full" />
      </div>
    </div>
  );
}
