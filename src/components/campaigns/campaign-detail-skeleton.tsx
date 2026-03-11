import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CampaignDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-8 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-xs" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xs" />
          <Skeleton className="h-8 w-16 rounded-xs" />
          <Skeleton className="h-8 w-20 rounded-xs" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24" />
          ))}
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} size="sm">
              <CardContent className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-sm" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Separator */}
        <Skeleton className="mb-6 h-px w-full" />

        {/* Config cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
