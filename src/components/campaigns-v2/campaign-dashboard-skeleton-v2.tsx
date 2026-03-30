import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CampaignDashboardSkeletonV2() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-8 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border shadow-sm">
            <CardContent className="flex items-center gap-3 py-1">
              <Skeleton className="size-10 rounded-[var(--radius-xs)]" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-14" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-sm" />

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-[var(--radius-sm)]" />
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-sm" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-sm" />
      ))}
    </div>
  );
}
