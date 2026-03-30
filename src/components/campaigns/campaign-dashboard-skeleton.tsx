import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CampaignDashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-40 rounded-xs" />
      </div>

      {/* KPI: Hero + secondary metrics */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <Skeleton className="size-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 py-4">
                <Skeleton className="size-9 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommendation banner */}
      <Skeleton className="h-16 w-full rounded-sm" />

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20" />
          ))}
        </div>

        {/* Table header */}
        <Skeleton className="h-10 w-full rounded-xs" />

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xs" />
        ))}
      </div>
    </div>
  );
}
