"use client";

import { Target, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/components/ui/empty-state";

interface CampaignEmptyStateProps {
  onCreateCampaign: () => void;
}

export function CampaignEmptyState({
  onCreateCampaign,
}: CampaignEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-8 py-16">
      <EmptyState className="max-w-md">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Target className="size-10 text-primary" />
          </div>
          <div className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-accent">
            <Sparkles className="size-4 text-accent-foreground" />
          </div>
        </div>

        <EmptyStateContent>
          <EmptyStateTitle className="font-headline text-xl font-semibold text-foreground">
            No campaigns yet
          </EmptyStateTitle>
          <EmptyStateDescription className="text-sm">
            Create your first campaign to engage customers with targeted messages
            across SMS, email, push notifications, and more.
          </EmptyStateDescription>
        </EmptyStateContent>

        <EmptyStateActions>
          <Button onClick={onCreateCampaign} size="lg">
            <Plus data-icon="inline-start" />
            Create Your First Campaign
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  );
}
