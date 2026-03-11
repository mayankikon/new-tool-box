import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

interface CampaignRecommendationBannerProps {
  onDismiss: () => void;
  onCreateCampaign: () => void;
}

export function CampaignRecommendationBanner({
  onDismiss,
  onCreateCampaign,
}: CampaignRecommendationBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative rounded-sm border border-[var(--violet-300)] bg-[var(--violet-50)] px-5 py-5 dark:border-[var(--violet-700)] dark:bg-[var(--violet-950)]"
    >
      {/* Dismiss */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDismiss}
        aria-label="Dismiss recommendation"
        className="absolute right-2 top-2"
      >
        <X className="size-3.5" />
      </Button>

      {/* Content */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-10 items-center justify-center rounded-sm bg-[var(--violet-500)]">
          <Sparkles className="size-5 text-white" />
        </div>

        <div className="max-w-md">
          <p className="text-sm font-semibold text-[var(--violet-700)] dark:text-[var(--violet-300)]">
            Smart Recommendation
          </p>
          <p className="mt-1 text-xs text-[var(--violet-600)] dark:text-[var(--violet-400)]">
            420 vehicles are approaching their 30,000-mile service interval.
            Create a targeted campaign to capture an estimated{" "}
            <span className="font-semibold text-[var(--violet-800)] dark:text-[var(--violet-200)]">
              $18.5K
            </span>{" "}
            in service revenue.
          </p>
        </div>

        <button
          onClick={onCreateCampaign}
          className="shimmer-border inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[var(--violet-600)] px-5 text-base font-medium text-white transition-colors hover:bg-[var(--violet-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-400)] focus-visible:ring-offset-2 dark:bg-[var(--violet-500)] dark:hover:bg-[var(--violet-600)]"
        >
          <Sparkles className="size-5" />
          Create Campaign
        </button>
      </div>
    </motion.div>
  );
}
