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
  | "lease-renewal"
  | "vehicle-trade-in"
  | "recall"
  | "custom";

export type Channel = "sms" | "email" | "push" | "in-app";

export type OfferType =
  | "fixed-discount"
  | "percentage-discount"
  | "service-bundle"
  | "free-add-on"
  | "seasonal-promotion"
  | "custom";

export type CouponCodeStrategy =
  | "single-code"
  | "unique-per-customer"
  | "barcode"
  | "manual";

/** Layout presets for the coupon editor (template-based, not free-form). */
export type CouponTemplateId =
  | "hero-banner"
  | "ticket-stub"
  | "minimal-card"
  | "split-band"
  | "badge-ribbon"
  | "dark-accent";

export type CouponBadgeKind =
  | "oil"
  | "brake"
  | "battery"
  | "tire"
  | "general"
  | "custom";

export type CouponCornerStyle = "rounded" | "sharp" | "pill";

/** Constrained accent options (dealership theming without arbitrary colors). */
export type CouponAccentPreset =
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "slate"
  | "violet"
  | "brand-primary"
  | "brand-secondary";

export interface CouponVisualSpec {
  templateId: CouponTemplateId;
  /** Customer-facing headline on the coupon card */
  headline: string;
  subheadline: string;
  ctaLabel: string;
  badge: CouponBadgeKind;
  customBadgeLabel?: string;
  accentPreset: CouponAccentPreset;
  cornerStyle: CouponCornerStyle;
  /** Optional dealership logo override for the card */
  logoUrl?: string;
  /** Optional catalog side-view image shown on the coupon (saved with the design) */
  vehicleImageUrl?: string;
  /** Short line under the vehicle image, e.g. "Honda Prologue" */
  vehicleCaption?: string;
  /** When false, hide dealership logo/name on the card (default: show when set) */
  showLogoOnCoupon?: boolean;
  /** When false, hide vehicle strip on the card (default: show when URL set) */
  showVehicleOnCoupon?: boolean;
  /** Short urgency line (gamification-light), e.g. “Limited spots this week” */
  urgencyLine?: string;
  showUrgencyLine?: boolean;
}

export type CouponExpirationMode = "relative" | "fixed";

export type CouponConditionRule =
  | { kind: "minInvoice"; minCents: number }
  | { kind: "serviceCategoryIn"; categories: string[] }
  | { kind: "firstTimeCustomer" }
  | { kind: "vinNotRedeemedBefore" };

export interface CouponRules {
  expirationMode: CouponExpirationMode;
  /** When mode is relative; should stay in sync with `CampaignOffer.expirationDays`. */
  expirationDays: number;
  /** ISO 8601 date (date-only or full); used when expirationMode is fixed */
  expiresAt?: string;
  maxRedemptionsTotal?: number;
  maxRedemptionsPerCustomer?: number;
  maxRedemptionsPerDay?: number;
  conditions: CouponConditionRule[];
}

export type WorkflowNodeType =
  | "entry"
  | "message"
  | "wait"
  | "condition"
  | "offer"
  | "goal";

export type WorkflowConditionEvent =
  | "opened"
  | "clicked"
  | "replied"
  | "booked-appointment"
  | "redeemed-coupon"
  | "no-response";

export type ResponseRuleEvent = Exclude<WorkflowConditionEvent, "no-response">;

export type SequenceRuleAction =
  | "stop"
  | "send-message"
  | "send-alternate-message"
  | "send-offer"
  | "send-confirmation";

export type CampaignGoalEvent =
  | "booked-appointment"
  | "redeemed-coupon"
  | "replied"
  | "clicked";

export type WorkflowPresetId =
  | "single-send"
  | "three-day-follow-up"
  | "no-response-escalation"
  | "coupon-recovery"
  | "booked-vs-not-booked";

export interface AudienceSegment {
  id: string;
  field: string;
  operator: string;
  value: string;
}

/** Who does NOT receive the campaign (e.g. contacted recently, has appointment, opted out). */
export interface ExclusionRule {
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
  /** Days after trigger event (e.g. purchase) when this message is sent. Omit = send at trigger time. */
  delayDays?: number;
  offerId?: string;
  isAlternateVersion?: boolean;
}

export interface CampaignOffer {
  id: string;
  type: OfferType;
  /** Internal / list label (wizard, workflow) */
  title: string;
  description: string;
  valueLabel: string;
  /** When type is percentage-discount; drives valueLabel when set */
  discountPercent?: number;
  /** When type is fixed-discount; whole cents, drives valueLabel when set */
  discountCents?: number;
  codeStrategy: CouponCodeStrategy;
  expirationDays: number;
  redemptionGoal: CampaignGoalEvent;
  eligibleServices: string[];
  channelSafeCopy: string;
  legalComplianceNote: string;
  recommendedChannels?: Channel[];
  isRecommended?: boolean;
  isApproved?: boolean;
  visual: CouponVisualSpec;
  rules: CouponRules;
}

export interface WorkflowCondition {
  event: WorkflowConditionEvent;
  waitDays?: number;
  evaluationScope: "customer" | "workflow";
  description: string;
}

export interface WorkflowGoal {
  id: string;
  label: string;
  successEvent: CampaignGoalEvent;
  stopOnGoal: boolean;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description?: string;
  messageIndex?: number;
  offerId?: string;
  delayDays?: number;
  sendWindowMode?: "immediate" | "after-delay" | "preferred-window";
  condition?: WorkflowCondition;
  goal?: WorkflowGoal;
  /** Set when this node maps to a response rule row (canvas inspector). */
  sourceResponseRuleId?: string;
  /** Set when this node maps to a no-response rule row (canvas inspector). */
  sourceNoResponseRuleId?: string;
  /** Set when this node maps to an offer escalation row (canvas inspector). */
  sourceOfferEscalationId?: string;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  branchLabel?: string;
}

export interface CampaignWorkflow {
  presetId?: WorkflowPresetId;
  entryNodeId: string;
  goalNodeId?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  validationErrors?: string[];
}

export interface CouponRecommendation {
  id: string;
  offerId: string;
  recommendedStrength: string;
  rationale: string[];
  confidence: "high" | "medium" | "low";
  status: "suggested" | "accepted" | "dismissed";
  requiresApproval: boolean;
  recommendedForNodeId?: string;
}

export interface ResponseRule {
  id: string;
  event: ResponseRuleEvent;
  afterMessageIndex: number;
  action: SequenceRuleAction;
  sendMessageIndex?: number;
  offerId?: string;
}

export interface NoResponseRule {
  id: string;
  afterMessageIndex: number;
  waitDays: number;
  action: Exclude<SequenceRuleAction, "send-confirmation">;
  sendMessageIndex?: number;
  offerId?: string;
}

export interface OfferEscalationRule {
  id: string;
  afterMessageIndex: number;
  waitDays: number;
  offerId?: string;
  sendMessageIndex?: number;
}

export interface CampaignSequenceLogic {
  presetId?: WorkflowPresetId;
  goal: CampaignGoalEvent;
  stopOnGoal: boolean;
  responseRules: ResponseRule[];
  noResponseRules: NoResponseRule[];
  offerEscalations: OfferEscalationRule[];
  validationErrors?: string[];
}

export interface ChannelConfig {
  channel: Channel;
  isEnabled: boolean;
  estimatedReach: number;
  /** When set, reach after excluding customers who opted out or lack consent. */
  estimatedReachWithConsent?: number;
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
  /** When set, links this campaign to a row in Smart Marketing > Templates (`tpl-library-*`). */
  marketingLibraryTemplateId?: string;
  audienceSegments: AudienceSegment[];
  /** Optional exclusion rules (who does not receive the campaign). */
  exclusionRules?: ExclusionRule[];
  audienceSize: number;
  trigger: CampaignTrigger;
  messages: CampaignMessage[];
  sequenceLogic?: CampaignSequenceLogic;
  workflow?: CampaignWorkflow;
  offers?: CampaignOffer[];
  couponRecommendations?: CouponRecommendation[];
  goal?: WorkflowGoal;
  channels: ChannelConfig[];
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  scheduledEndAt?: string;
  launchedAt?: string;
  completedAt?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: CampaignType;
  /**
   * ID of the matching entry in `MARKETING_TEMPLATE_LIBRARY` (Templates page).
   * Used so the wizard preview matches the marketing template card visuals.
   */
  marketingLibraryTemplateId: string;
  defaults: Partial<
    Pick<
      Campaign,
      "audienceSegments" | "trigger" | "messages" | "channels" | "sequenceLogic" | "offers"
    >
  >;
}

export interface DashboardMetrics {
  activeCampaigns: number;
  avgConversionRate: number;
  avgOpenRate: number;
  avgResponseRate: number;
  totalReached: number;
  totalRevenue: number;
  roiMultiple: number;
  /** Percent change vs previous period (e.g. +12 for +12% vs last month). */
  revenueTrendPercent?: number;
}

export type PersonalizationVariable =
  | "customer_name"
  | "vehicle_model"
  | "vehicle_year"
  | "vehicle_make"
  | "vehicle_trim"
  | "mileage"
  | "next_service_due"
  | "battery_health"
  | "last_service_date"
  | "dealership_name"
  | "service_director_name";

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

export interface WizardSequenceMessage extends WizardMessage {
  delayDays?: number;
  channel?: Channel;
  offerId?: string;
  isAlternateVersion?: boolean;
}

export interface ResponseTrackingSettings {
  opened: boolean;
  clicked: boolean;
  replied: boolean;
  "booked-appointment": boolean;
  "redeemed-coupon": boolean;
}

export interface WorkflowFallbackPaths {
  onNoResponse: "alternate-message" | "alternate-channel" | "offer-escalation";
  onGoalReached: "stop-workflow" | "confirmation-message";
}

/** Preferred send window (stored in trigger config or schedule preferences). */
export interface PreferredSendWindow {
  startHour: number;
  endHour: number;
}

export type CapacityHint = "low" | "normal" | "high";

/** TCPA/CTA compliance checklist (wizard-only; not persisted on Campaign unless backend requires). */
export interface ComplianceChecklist {
  consentConfirmed: boolean;
  optOutIncluded: boolean;
  identityIncluded: boolean;
}

export const DEFAULT_COMPLIANCE_CHECKLIST: ComplianceChecklist = {
  consentConfirmed: false,
  optOutIncluded: false,
  identityIncluded: false,
};

export const DEFAULT_RESPONSE_TRACKING: ResponseTrackingSettings = {
  opened: true,
  clicked: true,
  replied: true,
  "booked-appointment": true,
  "redeemed-coupon": true,
};

export const DEFAULT_WORKFLOW_FALLBACK_PATHS: WorkflowFallbackPaths = {
  onNoResponse: "alternate-message",
  onGoalReached: "stop-workflow",
};
