"use client";
import { Skeleton } from "@/components/ui/skeleton";
export default function SkeletonCard() {
  return (
    <div className="h-40 space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="flex h-5 flex-row items-start space-x-3 space-y-0">
          <Skeleton className="h-4 w-4" />
          <Skeleton className={`h-4 w-[80px]`} />
        </div>
      ))}
    </div>
  );
}
