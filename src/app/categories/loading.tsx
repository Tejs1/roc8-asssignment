import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-full flex-grow flex-col items-center">
      <div className="m-auto grid h-[422px] w-[504px] rounded-3xl border p-10">
        <Skeleton className="h-3/6 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    </main>
  );
}
