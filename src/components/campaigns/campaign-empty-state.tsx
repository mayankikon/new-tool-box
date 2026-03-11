"use client";

import { Target, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignEmptyStateProps {
  onCreateCampaign: () => void;
}

export function CampaignEmptyState({
  onCreateCampaign,
}: CampaignEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16 text-center">
      <div className="relative">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Target className="size-10 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-accent">
          <Sparkles className="size-4 text-accent-foreground" />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="font-headline text-xl font-semibold">
          No campaigns yet
        </h2>
        <p className="text-sm text-muted-foreground">
          Create your first campaign to engage customers with targeted messages
          across SMS, email, push notifications, and more.
        </p>
      </div>

      <Button onClick={onCreateCampaign} size="lg">
        <Plus data-icon="inline-start" />
        Create Your First Campaign
      </Button>
    </div>
  );
}
