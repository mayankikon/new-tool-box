import {
  createCouponVisualFromPreset,
  createDefaultCouponRules,
} from "./coupon-templates";
import type {
  CampaignGoalEvent,
  CampaignOffer,
  CampaignSequenceLogic,
  CampaignWorkflow,
  Channel,
  CouponRecommendation,
  NoResponseRule,
  OfferEscalationRule,
  PreferredSendWindow,
  ResponseRule,
  SequenceRuleAction,
  WizardSequenceMessage,
  WorkflowEdge,
  WorkflowGoal,
  WorkflowNode,
  WorkflowPresetId,
} from "./types";

export interface WorkflowPresetDefinition {
  id: WorkflowPresetId;
  label: string;
  description: string;
  headline: string;
}

export const WORKFLOW_PRESETS: WorkflowPresetDefinition[] = [
  {
    id: "single-send",
    label: "Single Send",
    description: "One message, one clear goal, and no added branching.",
    headline: "Best for simple reminders or announcements.",
  },
  {
    id: "three-day-follow-up",
    label: "Follow-up Sequence",
    description: "Start with outreach, then follow up if the customer stays quiet.",
    headline: "Good for lifecycle reminders and service nudges.",
  },
  {
    id: "no-response-escalation",
    label: "No-Response Escalation",
    description: "If the customer does not respond, send another message.",
    headline: "Use when you want a stronger second attempt.",
  },
  {
    id: "coupon-recovery",
    label: "Coupon Recovery",
    description: "Introduce an offer if there is no response after follow-up.",
    headline: "Ideal for win-back and overdue service campaigns.",
  },
  {
    id: "booked-vs-not-booked",
    label: "Booked vs Not Booked",
    description: "Split the campaign based on whether an appointment is booked.",
    headline: "Use when appointment completion is the primary goal.",
  },
];

export const DEFAULT_WORKFLOW_GOAL: WorkflowGoal = {
  id: "goal-booked",
  label: "Booked appointment",
  successEvent: "booked-appointment",
  stopOnGoal: true,
};

export function createDefaultOfferLibrary(): CampaignOffer[] {
  return [
    {
      id: "offer-fixed-25",
      type: "fixed-discount",
      title: "$25 Off Service",
      description: "Straightforward price incentive for deferred maintenance.",
      valueLabel: "$25 off",
      discountCents: 2500,
      codeStrategy: "unique-per-customer",
      expirationDays: 10,
      redemptionGoal: "booked-appointment",
      eligibleServices: ["Oil change", "Tire rotation", "Brake inspection"],
      channelSafeCopy: "Book this week and save $25 on your next service visit.",
      legalComplianceNote: "Valid once per VIN. Cannot be combined with other service offers.",
      recommendedChannels: ["sms", "email"],
      isRecommended: true,
      isApproved: false,
      visual: createCouponVisualFromPreset("hero-banner", {
        headline: "$25 off your next visit",
        subheadline: "Oil, tires, or brakes — use it on qualifying service this week.",
        ctaLabel: "Book now",
        badge: "oil",
        accentPreset: "emerald",
        showUrgencyLine: true,
        urgencyLine: "Limited bays this week",
      }),
      rules: {
        ...createDefaultCouponRules(10),
        maxRedemptionsPerCustomer: 1,
        conditions: [{ kind: "vinNotRedeemedBefore" }],
      },
    },
    {
      id: "offer-percent-15",
      type: "percentage-discount",
      title: "15% Off Scheduled Service",
      description: "Flexible percentage discount for higher-margin scheduled work.",
      valueLabel: "15% off",
      discountPercent: 15,
      codeStrategy: "unique-per-customer",
      expirationDays: 7,
      redemptionGoal: "booked-appointment",
      eligibleServices: ["30k service", "60k service", "Factory scheduled maintenance"],
      channelSafeCopy: "Schedule in the next 7 days to save 15% on your visit.",
      legalComplianceNote: "Excludes tires and warranty repairs. Max savings may apply.",
      recommendedChannels: ["email", "sms"],
      isRecommended: true,
      isApproved: false,
      visual: createCouponVisualFromPreset("split-band", {
        headline: "15% off scheduled maintenance",
        subheadline: "Factory-scheduled services only. Book within 7 days.",
        ctaLabel: "Schedule service",
        badge: "general",
        accentPreset: "blue",
      }),
      rules: {
        ...createDefaultCouponRules(7),
        maxRedemptionsTotal: 500,
        conditions: [{ kind: "serviceCategoryIn", categories: ["Maintenance"] }],
      },
    },
    {
      id: "offer-bundle-seasonal",
      type: "service-bundle",
      title: "Seasonal Care Bundle",
      description: "Bundle maintenance and inspection to increase basket size.",
      valueLabel: "Bundle pricing",
      codeStrategy: "single-code",
      expirationDays: 14,
      redemptionGoal: "redeemed-coupon",
      eligibleServices: ["Battery test", "Multi-point inspection", "Tire rotation"],
      channelSafeCopy: "Unlock our seasonal care bundle with battery check, inspection, and rotation.",
      legalComplianceNote: "Bundle contents vary by model year and service advisor approval.",
      recommendedChannels: ["email", "push"],
      isRecommended: false,
      isApproved: false,
      visual: createCouponVisualFromPreset("ticket-stub", {
        headline: "Seasonal care bundle",
        subheadline: "Battery check, inspection, and rotation in one visit.",
        ctaLabel: "Redeem bundle",
        badge: "battery",
        accentPreset: "amber",
        showUrgencyLine: true,
        urgencyLine: "Almost gone — book soon",
      }),
      rules: {
        ...createDefaultCouponRules(14),
        maxRedemptionsPerDay: 40,
        conditions: [{ kind: "minInvoice", minCents: 5000 }],
      },
    },
    {
      id: "offer-free-inspection",
      type: "free-add-on",
      title: "Free Inspection Add-On",
      description: "Low-friction offer to re-engage price-sensitive customers.",
      valueLabel: "Free inspection",
      codeStrategy: "single-code",
      expirationDays: 21,
      redemptionGoal: "booked-appointment",
      eligibleServices: ["Battery inspection", "Brake inspection", "Seasonal inspection"],
      channelSafeCopy: "Book now and we’ll include a free inspection during your visit.",
      legalComplianceNote: "Inspection only. Additional repairs are quoted separately.",
      recommendedChannels: ["sms", "push"],
      isRecommended: false,
      isApproved: false,
      visual: createCouponVisualFromPreset("minimal-card", {
        headline: "Complimentary inspection",
        subheadline: "We’ll check brakes, battery, and belts with your booked visit.",
        ctaLabel: "Add to booking",
        badge: "brake",
        accentPreset: "slate",
      }),
      rules: {
        ...createDefaultCouponRules(21),
        conditions: [{ kind: "firstTimeCustomer" }],
      },
    },
    {
      id: "offer-seasonal-promo",
      type: "seasonal-promotion",
      title: "Seasonal Promotion",
      description: "Flexible seasonal messaging for winterization or road-trip readiness.",
      valueLabel: "Seasonal offer",
      codeStrategy: "manual",
      expirationDays: 30,
      redemptionGoal: "redeemed-coupon",
      eligibleServices: ["Seasonal maintenance", "Tire service", "Cooling system service"],
      channelSafeCopy: "Claim this seasonal promotion before the window closes.",
      legalComplianceNote: "Dealer participation and inventory may vary.",
      recommendedChannels: ["email", "sms", "push"],
      isRecommended: false,
      isApproved: false,
      visual: createCouponVisualFromPreset("badge-ribbon", {
        headline: "Seasonal service special",
        subheadline: "Winterization, tires, and cooling — ask your advisor.",
        ctaLabel: "Get offer",
        badge: "tire",
        accentPreset: "violet",
        showUrgencyLine: true,
        urgencyLine: "Your bay is waiting",
      }),
      rules: {
        ...createDefaultCouponRules(30),
        maxRedemptionsTotal: 200,
      },
    },
    {
      id: "offer-custom",
      type: "custom",
      title: "Custom Promotion",
      description: "Manually tailored incentive for dealership-specific campaigns.",
      valueLabel: "Custom",
      codeStrategy: "manual",
      expirationDays: 14,
      redemptionGoal: "clicked",
      eligibleServices: ["Custom"],
      channelSafeCopy: "Customize this promotion before launch.",
      legalComplianceNote: "Ensure local advertising and TCPA/CTA compliance before use.",
      recommendedChannels: ["email"],
      isRecommended: false,
      isApproved: false,
      visual: createCouponVisualFromPreset("dark-accent", {
        headline: "Your custom offer",
        subheadline: "Tailor copy and rules on your coupon before launch.",
        ctaLabel: "Learn more",
        badge: "general",
        accentPreset: "rose",
      }),
      rules: createDefaultCouponRules(14),
    },
  ];
}

export function createCouponRecommendations(
  offers: CampaignOffer[],
): CouponRecommendation[] {
  return offers
    .filter((offer) => offer.isRecommended)
    .map((offer, index) => ({
      id: `rec-offer-${index + 1}`,
      offerId: offer.id,
      recommendedStrength:
        offer.type === "percentage-discount"
          ? "Moderate incentive"
          : "Low-friction recovery offer",
      rationale: getOfferRecommendationReasons(offer),
      confidence: index === 0 ? "high" : "medium",
      status: "suggested",
      requiresApproval: true,
    }));
}

function getOfferRecommendationReasons(offer: CampaignOffer): string[] {
  switch (offer.type) {
    case "fixed-discount":
      return [
        "Balances conversion lift with margin protection for overdue service customers.",
        "Per-customer codes reduce coupon leakage across branches.",
      ];
    case "percentage-discount":
      return [
        "Works well for higher-ticket scheduled maintenance.",
        "Strong fit for customers showing urgency but not yet booking.",
      ];
    default:
      return [
        "Useful as a recovery path when engagement stalls.",
        "Keeps the workflow flexible across channels and service types.",
      ];
  }
}

export function createSequenceLogicFromPreset(params: {
  presetId: WorkflowPresetId;
  messages: WizardSequenceMessage[];
  offers: CampaignOffer[];
  goal?: WorkflowGoal;
}): CampaignSequenceLogic {
  const { presetId, messages, offers, goal = DEFAULT_WORKFLOW_GOAL } = params;
  const secondMessageIndex = messages[1] ? 1 : 0;
  const thirdMessageIndex = messages[2] ? 2 : secondMessageIndex;
  const recommendedOffer = offers.find((offer) => offer.isRecommended) ?? offers[0];

  switch (presetId) {
    case "single-send":
      return finalizeSequenceLogic({
        presetId,
        goal: goal.successEvent,
        stopOnGoal: true,
        responseRules: [],
        noResponseRules: [],
        offerEscalations: [],
      }, messages, offers);
    case "booked-vs-not-booked":
      return finalizeSequenceLogic({
        presetId,
        goal: "booked-appointment",
        stopOnGoal: true,
        responseRules: [
          {
            id: "resp-booked-stop",
            event: "booked-appointment",
            afterMessageIndex: 0,
            action: "stop",
          },
        ],
        noResponseRules: [
          {
            id: "nresp-booking-reminder",
            afterMessageIndex: 0,
            waitDays: 2,
            action: "send-message",
            sendMessageIndex: secondMessageIndex,
          },
        ],
        offerEscalations: [],
      }, messages, offers);
    case "coupon-recovery":
      return finalizeSequenceLogic({
        presetId,
        goal: goal.successEvent,
        stopOnGoal: true,
        responseRules: [
          {
            id: "resp-booked-stop",
            event: goal.successEvent === "redeemed-coupon" ? "redeemed-coupon" : "booked-appointment",
            afterMessageIndex: 0,
            action: "stop",
          },
        ],
        noResponseRules: [
          {
            id: "nresp-send-recovery",
            afterMessageIndex: 0,
            waitDays: 2,
            action: "send-message",
            sendMessageIndex: secondMessageIndex,
          },
        ],
        offerEscalations: [
          {
            id: "offer-recovery",
            afterMessageIndex: secondMessageIndex,
            waitDays: 2,
            offerId: recommendedOffer?.id,
            sendMessageIndex: thirdMessageIndex,
          },
        ],
      }, messages, offers);
    case "three-day-follow-up":
      return finalizeSequenceLogic({
        presetId,
        goal: goal.successEvent,
        stopOnGoal: true,
        responseRules: [
          {
            id: "resp-goal-stop",
            event: goal.successEvent === "redeemed-coupon" ? "redeemed-coupon" : "booked-appointment",
            afterMessageIndex: 0,
            action: "stop",
          },
        ],
        noResponseRules: [
          {
            id: "nresp-follow-up",
            afterMessageIndex: 0,
            waitDays: 3,
            action: "send-message",
            sendMessageIndex: secondMessageIndex,
          },
        ],
        offerEscalations: [],
      }, messages, offers);
    case "no-response-escalation":
    default:
      return finalizeSequenceLogic({
        presetId,
        goal: goal.successEvent,
        stopOnGoal: true,
        responseRules: [
          {
            id: "resp-replied-stop",
            event: "replied",
            afterMessageIndex: 0,
            action: "stop",
          },
        ],
        noResponseRules: [
          {
            id: "nresp-alternate",
            afterMessageIndex: 0,
            waitDays: 2,
            action: "send-alternate-message",
            sendMessageIndex: secondMessageIndex,
          },
        ],
        offerEscalations: [],
      }, messages, offers);
  }
}

function finalizeSequenceLogic(
  logic: CampaignSequenceLogic,
  messages: WizardSequenceMessage[],
  offers: CampaignOffer[],
): CampaignSequenceLogic {
  return {
    ...logic,
    validationErrors: validateSequenceLogic(messages, logic, offers),
  };
}

export function validateSequenceLogic(
  messages: WizardSequenceMessage[],
  sequenceLogic: CampaignSequenceLogic | undefined,
  offers: CampaignOffer[],
): string[] {
  if (!sequenceLogic) return [];

  const errors: string[] = [];
  const hasMessageAt = (index: number | undefined) =>
    index != null && index >= 0 && index < messages.length;
  const offerIds = new Set(offers.map((offer) => offer.id));

  for (const rule of sequenceLogic.responseRules) {
    if (!hasMessageAt(rule.afterMessageIndex)) {
      errors.push("A response rule references a missing message.");
    }
    if (rule.action === "send-message" || rule.action === "send-alternate-message") {
      if (!hasMessageAt(rule.sendMessageIndex)) {
        errors.push("A response rule needs a valid follow-up message.");
      }
    }
    if (rule.action === "send-offer" && (!rule.offerId || !offerIds.has(rule.offerId))) {
      errors.push("A response rule needs a valid offer.");
    }
  }

  for (const rule of sequenceLogic.noResponseRules) {
    if (!hasMessageAt(rule.afterMessageIndex)) {
      errors.push("A no-response rule references a missing message.");
    }
    if (rule.waitDays < 0) {
      errors.push("A no-response rule has an invalid wait period.");
    }
    if (rule.action === "send-message" || rule.action === "send-alternate-message") {
      if (!hasMessageAt(rule.sendMessageIndex)) {
        errors.push("A no-response rule needs a valid next message.");
      }
    }
    if (rule.action === "send-offer" && (!rule.offerId || !offerIds.has(rule.offerId))) {
      errors.push("A no-response rule needs a valid offer.");
    }
  }

  for (const escalation of sequenceLogic.offerEscalations) {
    if (!hasMessageAt(escalation.afterMessageIndex)) {
      errors.push("An offer escalation references a missing message.");
    }
    if (!escalation.offerId || !offerIds.has(escalation.offerId)) {
      errors.push("An offer escalation needs a valid offer.");
    }
    if (
      escalation.sendMessageIndex != null &&
      !hasMessageAt(escalation.sendMessageIndex)
    ) {
      errors.push("An offer escalation needs a valid message to attach to.");
    }
  }

  for (const message of messages) {
    if (message.offerId) {
      const offer = offers.find((item) => item.id === message.offerId);
      if (!offer) {
        errors.push("A message references an offer that no longer exists.");
      } else if (
        message.channel &&
        offer.recommendedChannels &&
        offer.recommendedChannels.length > 0 &&
        !offer.recommendedChannels.includes(message.channel)
      ) {
        errors.push(`"${offer.title}" is not recommended for the selected message channel.`);
      }
    }
  }

  return Array.from(new Set(errors));
}

export function deriveWorkflowFromSequenceLogic(params: {
  messages: WizardSequenceMessage[];
  offers: CampaignOffer[];
  sequenceLogic?: CampaignSequenceLogic;
  preferredSendWindow?: PreferredSendWindow;
  goal?: WorkflowGoal;
}): CampaignWorkflow {
  const {
    messages,
    offers,
    sequenceLogic,
    preferredSendWindow,
    goal = DEFAULT_WORKFLOW_GOAL,
  } = params;

  const nodes: WorkflowNode[] = [
    {
      id: "node-entry",
      type: "entry",
      label: "Campaign starts",
      description: "Customers enter after the trigger fires.",
    },
  ];
  const edges: WorkflowEdge[] = [];

  if (messages.length === 0) {
    nodes.push({
      id: "node-goal-empty",
      type: "goal",
      label: goal.label,
      description: "No messages configured yet.",
      goal,
    });
    edges.push({
      id: "edge-entry-goal-empty",
      from: "node-entry",
      to: "node-goal-empty",
    });
    return finalizeWorkflow({
      presetId: sequenceLogic?.presetId ?? "single-send",
      nodes,
      edges,
    });
  }

  messages.forEach((message, index) => {
    nodes.push({
      id: `node-message-${index + 1}`,
      type: "message",
      label: message.isAlternateVersion ? `Alternate Message ${index + 1}` : `Message ${index + 1}`,
      description: describeMessageNode(message, index),
      messageIndex: index,
    });

    if (index === 0) {
      edges.push({
        id: "edge-entry-message-1",
        from: "node-entry",
        to: "node-message-1",
      });
    }

    if (index < messages.length - 1) {
      edges.push({
        id: `edge-message-${index + 1}-message-${index + 2}`,
        from: `node-message-${index + 1}`,
        to: `node-message-${index + 2}`,
      });
    }
  });

  const goalNodeId = "node-goal";
  nodes.push({
    id: goalNodeId,
    type: "goal",
    label: goal.label,
    description: "Campaign stops when the goal is reached.",
    goal,
  });

  edges.push({
    id: `edge-message-${messages.length}-goal`,
    from: `node-message-${messages.length}`,
    to: goalNodeId,
  });

  const allRules = sequenceLogic
    ? [
        ...sequenceLogic.responseRules.map((rule) => ({ kind: "response" as const, rule })),
        ...sequenceLogic.noResponseRules.map((rule) => ({ kind: "no-response" as const, rule })),
      ]
    : [];

  allRules.forEach(({ kind, rule }) => {
    const conditionNodeId = `node-condition-${rule.id}`;
    const defaultTarget = getDefaultTargetId(messages, rule.afterMessageIndex);
    const sourceField =
      kind === "response"
        ? { sourceResponseRuleId: rule.id }
        : { sourceNoResponseRuleId: rule.id };
    nodes.push({
      id: conditionNodeId,
      type: "condition",
      label: kind === "response" ? "Response rule" : "No-response rule",
      description:
        kind === "response"
          ? `If customer ${rule.event.replace(/-/g, " ")} after Message ${rule.afterMessageIndex + 1}`
          : `If no response ${rule.waitDays} day${rule.waitDays === 1 ? "" : "s"} after Message ${rule.afterMessageIndex + 1}`,
      condition: {
        event: kind === "response" ? rule.event : "no-response",
        waitDays: kind === "response" ? 0 : rule.waitDays,
        evaluationScope: "customer",
        description:
          kind === "response"
            ? `Branch on ${rule.event.replace(/-/g, " ")}`
            : `Branch on no response after ${rule.waitDays} day${rule.waitDays === 1 ? "" : "s"}`,
      },
      ...sourceField,
    });

    edges.push({
      id: `edge-message-${rule.afterMessageIndex + 1}-condition-${rule.id}`,
      from: `node-message-${rule.afterMessageIndex + 1}`,
      to: conditionNodeId,
    });

    edges.push({
      id: `edge-condition-${rule.id}-default`,
      from: conditionNodeId,
      to: defaultTarget,
      branchLabel: kind === "response" ? "No" : "Responded",
    });

    const actionTarget = buildActionTargetNodes({
      rule,
      kind,
      nodes,
      edges,
      offers,
      goalNodeId,
      preferredSendWindow,
    });

    edges.push({
      id: `edge-condition-${rule.id}-action`,
      from: conditionNodeId,
      to: actionTarget,
      branchLabel: kind === "response" ? "Yes" : "No response",
    });
  });

  sequenceLogic?.offerEscalations.forEach((escalation) => {
    const offer = offers.find((item) => item.id === escalation.offerId);
    const offerNodeId = `node-offer-escalation-${escalation.id}`;
    nodes.push({
      id: offerNodeId,
      type: "offer",
      label: offer?.title ?? "Offer escalation",
      description: `After Message ${escalation.afterMessageIndex + 1}${escalation.waitDays ? ` • ${escalation.waitDays} day wait` : ""}`,
      offerId: escalation.offerId,
      sourceOfferEscalationId: escalation.id,
    });

    edges.push({
      id: `edge-message-${escalation.afterMessageIndex + 1}-offer-${escalation.id}`,
      from: `node-message-${escalation.afterMessageIndex + 1}`,
      to: offerNodeId,
    });

    if (escalation.sendMessageIndex != null) {
      edges.push({
        id: `edge-offer-${escalation.id}-message-${escalation.sendMessageIndex + 1}`,
        from: offerNodeId,
        to: `node-message-${escalation.sendMessageIndex + 1}`,
      });
    } else {
      edges.push({
        id: `edge-offer-${escalation.id}-goal`,
        from: offerNodeId,
        to: goalNodeId,
      });
    }
  });

  return finalizeWorkflow({
    presetId: sequenceLogic?.presetId ?? "single-send",
    nodes,
    edges,
  });
}

function buildActionTargetNodes(params: {
  rule: ResponseRule | NoResponseRule;
  kind: "response" | "no-response";
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  offers: CampaignOffer[];
  goalNodeId: string;
  preferredSendWindow?: PreferredSendWindow;
}): string {
  const { rule, kind, nodes, edges, offers, goalNodeId, preferredSendWindow } = params;

  const ruleSource =
    kind === "response"
      ? { sourceResponseRuleId: rule.id }
      : { sourceNoResponseRuleId: rule.id };

  switch (rule.action) {
    case "stop":
      return goalNodeId;
    case "send-message":
    case "send-alternate-message":
      return `node-message-${(rule.sendMessageIndex ?? 0) + 1}`;
    case "send-confirmation": {
      const nodeId = `node-confirmation-${rule.id}`;
      nodes.push({
        id: nodeId,
        type: "message",
        label: "Confirmation message",
        description: preferredSendWindow
          ? `Send within preferred window ${formatPreferredWindow(preferredSendWindow)}`
          : "Send confirmation follow-up.",
        messageIndex: rule.sendMessageIndex,
        ...ruleSource,
      });
      edges.push({
        id: `edge-confirmation-${rule.id}-goal`,
        from: nodeId,
        to: goalNodeId,
      });
      return nodeId;
    }
    case "send-offer": {
      const nodeId = `node-rule-offer-${rule.id}`;
      const offer = offers.find((item) => item.id === rule.offerId);
      nodes.push({
        id: nodeId,
        type: "offer",
        label: offer?.title ?? "Offer follow-up",
        description: offer?.valueLabel ?? "Offer attached by rule",
        offerId: rule.offerId,
        ...ruleSource,
      });
      edges.push({
        id: `edge-rule-offer-${rule.id}-goal`,
        from: nodeId,
        to: goalNodeId,
      });
      return nodeId;
    }
    default:
      return goalNodeId;
  }
}

function getDefaultTargetId(
  messages: WizardSequenceMessage[],
  afterMessageIndex: number,
): string {
  if (afterMessageIndex + 1 < messages.length) {
    return `node-message-${afterMessageIndex + 2}`;
  }
  return "node-goal";
}

function describeMessageNode(message: WizardSequenceMessage, index: number): string {
  const dayLabel =
    message.delayDays != null
      ? `Day ${message.delayDays}`
      : index === 0
        ? "Day 0"
        : `Message ${index + 1}`;
  const channelLabel = message.channel ? message.channel.toUpperCase() : "Message";
  return `${dayLabel} • ${channelLabel}`;
}

function finalizeWorkflow(input: {
  presetId: WorkflowPresetId;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}): CampaignWorkflow {
  const validationErrors = validateWorkflow(input.nodes, input.edges);
  const goalNode = input.nodes.find((node) => node.type === "goal");
  return {
    presetId: input.presetId,
    entryNodeId: "node-entry",
    goalNodeId: goalNode?.id,
    nodes: input.nodes,
    edges: input.edges,
    validationErrors,
  };
}

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      errors.push("Workflow has a branch pointing to a missing step.");
      break;
    }
  }

  const outgoingCounts = edges.reduce<Record<string, number>>((acc, edge) => {
    acc[edge.from] = (acc[edge.from] ?? 0) + 1;
    return acc;
  }, {});

  for (const node of nodes) {
    if (node.type !== "goal" && !outgoingCounts[node.id]) {
      errors.push(`"${node.label}" needs a next step.`);
    }
    if (node.type === "condition" && outgoingCounts[node.id] < 2) {
      errors.push(`"${node.label}" needs both outcomes defined.`);
    }
    if (node.type === "offer" && !node.offerId) {
      errors.push(`"${node.label}" needs an attached offer.`);
    }
  }

  return Array.from(new Set(errors));
}

export function summarizeSequenceLogic(
  sequenceLogic: CampaignSequenceLogic | undefined,
  offers: CampaignOffer[],
  messages: WizardSequenceMessage[],
): {
  messageSchedule: string[];
  branchRules: string[];
  offerRules: string[];
  stopRules: string[];
  channels: Channel[];
} {
  const messageSchedule = messages.map((message, index) => {
    const dayLabel =
      message.delayDays != null
        ? `Day ${message.delayDays}`
        : index === 0
          ? "Day 0"
          : `Message ${index + 1}`;
    const channelLabel = message.channel ? message.channel.toUpperCase() : "Message";
    const offerLabel = message.offerId
      ? offers.find((offer) => offer.id === message.offerId)?.title
      : null;
    return `${dayLabel}: Message ${index + 1} via ${channelLabel}${offerLabel ? ` with ${offerLabel}` : ""}`;
  });

  if (!sequenceLogic) {
    return {
      messageSchedule,
      branchRules: [],
      offerRules: [],
      stopRules: [],
      channels: Array.from(
        new Set(messages.map((message) => message.channel).filter(Boolean) as Channel[]),
      ),
    };
  }

  const branchRules = [
    ...sequenceLogic.responseRules.map((rule) => summarizeResponseRule(rule, offers)),
    ...sequenceLogic.noResponseRules.map((rule) => summarizeNoResponseRule(rule, offers)),
  ];
  const offerRules = sequenceLogic.offerEscalations.map((rule) =>
    summarizeOfferEscalation(rule, offers),
  );
  const stopRules = sequenceLogic.stopOnGoal
    ? [`Stop the campaign once the customer ${formatGoalEvent(sequenceLogic.goal)}.`]
    : [];

  return {
    messageSchedule,
    branchRules,
    offerRules,
    stopRules,
    channels: Array.from(
      new Set(messages.map((message) => message.channel).filter(Boolean) as Channel[]),
    ),
  };
}

export function summarizeWorkflow(
  workflow: CampaignWorkflow | undefined,
  offers: CampaignOffer[],
  messages: WizardSequenceMessage[],
): {
  branchRules: string[];
  waitSteps: string[];
  offers: string[];
  channels: Channel[];
} {
  if (!workflow) {
    return {
      branchRules: [],
      waitSteps: [],
      offers: messages
        .map((message) => offers.find((offer) => offer.id === message.offerId)?.title)
        .filter(Boolean) as string[],
      channels: Array.from(
        new Set(messages.map((message) => message.channel).filter(Boolean) as Channel[]),
      ),
    };
  }

  return {
    branchRules: workflow.nodes
      .filter((node) => node.type === "condition" && node.condition)
      .map(
        (node) =>
          `${node.label}: ${node.condition!.event.replace(/-/g, " ")}${
            node.condition!.waitDays
              ? ` after ${node.condition!.waitDays} day${node.condition!.waitDays === 1 ? "" : "s"}`
              : ""
          }`,
      ),
    waitSteps: workflow.nodes
      .filter((node) => node.type === "wait")
      .map(
        (node) =>
          `${node.label}${node.delayDays != null ? ` • ${node.delayDays} day${node.delayDays === 1 ? "" : "s"}` : ""}`,
      ),
    offers: workflow.nodes
      .filter((node) => node.type === "offer" && node.offerId)
      .map((node) => offers.find((offer) => offer.id === node.offerId)?.title ?? node.label),
    channels: Array.from(
      new Set(
        workflow.nodes
          .filter((node) => node.type === "message")
          .map((node) => messages[node.messageIndex ?? 0]?.channel)
          .filter(Boolean) as Channel[],
      ),
    ),
  };
}

function summarizeResponseRule(
  rule: ResponseRule,
  offers: CampaignOffer[],
): string {
  return `If the customer ${rule.event.replace(/-/g, " ")} after Message ${rule.afterMessageIndex + 1}, ${formatAction(rule.action, rule.sendMessageIndex, rule.offerId, offers)}.`;
}

function summarizeNoResponseRule(
  rule: NoResponseRule,
  offers: CampaignOffer[],
): string {
  return `If there is no response after Message ${rule.afterMessageIndex + 1} in ${rule.waitDays} day${rule.waitDays === 1 ? "" : "s"}, ${formatAction(rule.action, rule.sendMessageIndex, rule.offerId, offers)}.`;
}

function summarizeOfferEscalation(
  rule: OfferEscalationRule,
  offers: CampaignOffer[],
): string {
  const offer = offers.find((item) => item.id === rule.offerId)?.title ?? "selected offer";
  return `After Message ${rule.afterMessageIndex + 1}, wait ${rule.waitDays} day${rule.waitDays === 1 ? "" : "s"} and send ${offer}${rule.sendMessageIndex != null ? ` with Message ${rule.sendMessageIndex + 1}` : ""}.`;
}

function formatAction(
  action: SequenceRuleAction,
  sendMessageIndex: number | undefined,
  offerId: string | undefined,
  offers: CampaignOffer[],
): string {
  switch (action) {
    case "stop":
      return "stop the campaign";
    case "send-message":
      return `send Message ${(sendMessageIndex ?? 0) + 1}`;
    case "send-alternate-message":
      return `send alternate Message ${(sendMessageIndex ?? 0) + 1}`;
    case "send-offer":
      return `send ${offers.find((offer) => offer.id === offerId)?.title ?? "the selected offer"}`;
    case "send-confirmation":
      return "send a confirmation message";
    default:
      return "continue the campaign";
  }
}

export function formatPreferredWindow(window: PreferredSendWindow): string {
  return `${formatHour(window.startHour)}-${formatHour(window.endHour)}`;
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

export function formatGoalEvent(event: CampaignGoalEvent): string {
  return event.replace(/-/g, " ");
}
