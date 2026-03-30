import type {
  AudienceSegment,
  CampaignOffer,
  CampaignTrigger,
  CampaignType,
} from "@/lib/campaigns/types";

export type AtlasAiIntent =
  | "oil-change"
  | "overdue-service"
  | "lease-end"
  | "warranty-expiration"
  | "recall"
  | "winback"
  | "bdc-list"
  | "campaign-recommendation"
  | "battery-health"
  | "thirty-k-service"
  | "relocation"
  | "defection"
  | "competitor-visit"
  | "unknown";

export interface AtlasAiHomeModule {
  id: string;
  title: string;
  description: string;
  prompt: string;
  examples?: string[];
  iconKey?: string;
}

export interface AtlasAiPromptSuggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface AtlasAiInsightMetric {
  id: string;
  label: string;
  value: string;
}

export interface AtlasAiCustomerPreviewRow {
  id: string;
  name: string;
  vehicle: string;
  lastServiceDate?: string;
  mileage?: number;
  serviceDueReason?: string;
  priority: "high" | "medium" | "low";
}

export interface AtlasAiAudiencePreview {
  label: string;
  description: string;
  totalCount: number;
  rows: AtlasAiCustomerPreviewRow[];
}

export interface AtlasAiRecommendedAction {
  id: string;
  label: string;
  description: string;
  kind: "export" | "bdc" | "campaign";
  emphasis: "primary" | "secondary";
}

export interface AtlasAiCampaignSuggestion {
  title: string;
  description: string;
  campaignType: CampaignType;
  templateId?: string;
  presetId?: string;
  estimatedReach: number;
  estimatedRevenue?: number;
  audienceLabel: string;
  audienceSegments: AudienceSegment[];
  trigger?: CampaignTrigger;
  /** Intelligent coupon draft merged into the campaign wizard when creating from Atlas */
  suggestedOffer?: Partial<CampaignOffer>;
}

export interface AtlasAiResponse {
  intent: AtlasAiIntent;
  userQuery: string;
  headline: string;
  summary: string;
  whyItMatters: string;
  metrics: AtlasAiInsightMetric[];
  insightCategory?: string;
  insightTags?: string[];
  nextBestActionLabel?: string;
  audiencePreview?: AtlasAiAudiencePreview;
  recommendedActions: AtlasAiRecommendedAction[];
  followUpPrompts: AtlasAiPromptSuggestion[];
  campaignSuggestion?: AtlasAiCampaignSuggestion;
}

export interface AtlasAiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: AtlasAiResponse;
}
