"use client";

import { Users, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InlineTip } from "@/components/ui/inline-tip";
import type { AudienceSegment } from "@/lib/campaigns/types";

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString();
}

interface CampaignAudienceViewV2Props {
  segments: AudienceSegment[];
  audienceSize: number;
}

export function CampaignAudienceViewV2({
  segments,
  audienceSize,
}: CampaignAudienceViewV2Props) {
  return (
    <div className="space-y-6 pt-4">
      <Card className="border border-border shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-headline tracking-tight">
                {formatNumber(audienceSize)}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimated audience size
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {segments.length} filter{segments.length !== 1 ? "s" : ""}{" "}
              applied
            </span>
          </div>
        </CardContent>
      </Card>

      {segments.length > 3 && (
        <InlineTip variant="info" title="Tip:">
          You have {segments.length} filters applied. Consider reviewing to
          ensure your audience is not too narrow.
        </InlineTip>
      )}

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Filter className="size-4 text-muted-foreground" />
          Segment Rules
        </h3>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Filter Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {segments.map((segment, index) => (
                <div key={segment.id}>
                  {index > 0 && (
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        and
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{segment.field}</Badge>
                    <span className="text-muted-foreground">
                      {segment.operator}
                    </span>
                    <span className="font-medium">{segment.value}</span>
                  </div>
                </div>
              ))}
              {segments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No audience filters configured.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
