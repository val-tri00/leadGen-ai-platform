import { Skeleton } from "@/app/components/ui/skeleton";

type LoadingSkeletonProps = {
  variant?: "cards" | "table" | "timeline";
  rows?: number;
};

export function LoadingSkeleton({ variant = "cards", rows = 3 }: LoadingSkeletonProps) {
  if (variant === "table") {
    return (
      <div className="rounded-xl border border-border bg-card/80 p-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton className="h-16 w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "timeline") {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="flex gap-3" key={index}>
            <Skeleton className="mt-2 size-3 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card-grid">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="rounded-xl border border-border bg-card/80 p-5" key={index}>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-4 h-8 w-1/2" />
          <Skeleton className="mt-4 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
