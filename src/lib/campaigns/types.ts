export type CampaignStatus =
  | "draft"
  | "active"
  | "scheduled"
  | "completed"
  | "paused";

export type CampaignType =
  | "service-reminder"
  | "new-owner"
  | "oil-change"
  | "battery-health"
  | "warranty-expiration"
  | "seasonal-promotion"
  | "custom";

export type Channel = "sms" | "email" | "push" | "in-app";

export interface AudienceSegment {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface CampaignTrigger {
  type:
    | "time-based"
    | "mileage"
    | "diagnostic"
    | "health"
    | "proximity"
    | "seasonal";
  isRecurring: boolean;
  config: Record<string, unknown>;
}

export interface CampaignMessage {
  subject?: string;
  body: string;
  channel: Channel;
}

export interface ChannelConfig {
  channel: Channel;
  isEnabled: boolean;
  estimatedReach: number;
}

export interface CampaignMetrics {
  reach: number;
  responseRate: number;
  conversionRate: number;
  revenue: number;
  appointments: number;
  openRate?: number;
  engagementRate?: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  audienceSegments: AudienceSegment[];
  audienceSize: number;
  trigger: CampaignTrigger;
  messages: CampaignMessage[];
  channels: ChannelConfig[];
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  launchedAt?: string;
  completedAt?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: CampaignType;
  defaults: Partial<
    Pick<Campaign, "audienceSegments" | "trigger" | "messages" | "channels">
  >;
}

export interface DashboardMetrics {
  activeCampaigns: number;
  avgConversionRate: number;
  totalReached: number;
  totalRevenue: number;
  /** Percent change vs previous period (e.g. +12 for +12% vs last month). */
  revenueTrendPercent?: number;
}

export type PersonalizationVariable =
  | "customer_name"
  | "vehicle_model"
  | "vehicle_year"
  | "vehicle_make"
  | "mileage"
  | "next_service_due"
  | "battery_health"
  | "last_service_date"
  | "dealership_name";

export interface ImageAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  /** When "video", url is the video blob; gifPreviewUrl is a 3s GIF preview. */
  kind?: "image" | "video";
  /** For kind "video": object URL of a ~3 second GIF generated from the video. */
  gifPreviewUrl?: string;
}

export interface WizardMessage {
  subject: string;
  body: string;
  variables: PersonalizationVariable[];
  aiPrompt: string;
  images: ImageAttachment[];
}
