export type TemplateLifecycleStage =
  | "onboarding"
  | "service-revenue"
  | "research-education"
  | "win-back-retention";

export type TemplateCategory =
  | "Onboarding"
  | "Service Promotions"
  | "Research & Education"
  | "Win-Back & Retention";

export type TemplateIconKey =
  | "handshake"
  | "calendar"
  | "sparkles"
  | "wrench"
  | "shield"
  | "message-square"
  | "badge-percent"
  | "car-front"
  | "refresh"
  | "search"
  | "star";

export type TemplateAccentVariant =
  | "primary"
  | "sky"
  | "amber"
  | "emerald"
  | "teal"
  | "rose";

export type TemplateChannel = "sms" | "email" | "push";
export type TemplatePreviewMode = "sms" | "email" | "note";

export interface MarketingTemplateCard {
  id: string;
  title: string;
  description: string;
  lifecycleStage: TemplateLifecycleStage;
  templateType: TemplateCategory;
  iconKey: TemplateIconKey;
  accentVariant: TemplateAccentVariant;
  channels: TemplateChannel[];
  previewMode: TemplatePreviewMode;
  previewContent: string;
  previewSubject?: string;
  draftContent: string;
  draftNotes?: string;
  recommended?: boolean;
}

export interface TemplateFilterOption {
  id: "all" | TemplateLifecycleStage;
  label: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  stage?: TemplateLifecycleStage;
  recommendedOnly?: boolean;
}

export const TEMPLATE_FILTERS: TemplateFilterOption[] = [
  { id: "all", label: "All templates" },
  { id: "onboarding", label: "Onboarding" },
  { id: "service-revenue", label: "Service revenue" },
  { id: "research-education", label: "Research & Education" },
  { id: "win-back-retention", label: "Win-Back & Retention" },
];

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    id: "recommended",
    title: "Recommended for the customer lifecycle",
    description:
      "Start with the highest-leverage touchpoints that move new owners into loyal service customers.",
    recommendedOnly: true,
  },
  {
    id: "onboarding",
    title: "Onboarding",
    description:
      "Build trust right after purchase and guide owners into their first service relationship.",
    stage: "onboarding",
  },
  {
    id: "service-revenue",
    title: "Service revenue",
    description:
      "Keep routine maintenance, seasonal offers, and protection plan conversations flowing.",
    stage: "service-revenue",
  },
  {
    id: "research-education",
    title: "Research & Education",
    description:
      "Answer ownership questions, reinforce feature value, and keep customers engaged between visits.",
    stage: "research-education",
  },
  {
    id: "win-back-retention",
    title: "Win back inactive customers",
    description:
      "Reconnect with owners who have gone quiet and bring them back before they defect to another shop.",
    stage: "win-back-retention",
  },
];

export const MARKETING_TEMPLATE_LIBRARY: MarketingTemplateCard[] = [
  {
    id: "tpl-library-001",
    title: "Purchase Day Welcome",
    description: "Welcome a buyer immediately and introduce your service team.",
    lifecycleStage: "onboarding",
    templateType: "Onboarding",
    iconKey: "handshake",
    accentVariant: "primary",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Welcome new buyers and introduce the dealership relationship after the sale.",
    draftNotes: "Day 0 welcome message focused on reassurance, gratitude, and service introduction.",
    draftContent:
      "Hi {{customer_name}}, congratulations on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} and welcome to {{dealership_name}}. We appreciate the opportunity to earn your business.\n\nI wanted to personally introduce our service team and make sure you know we are here well beyond the sale. If you have any questions about features, maintenance, warning lights, connectivity, or your ownership experience, you can reach out to us anytime.\n\nWhen your first service visit comes around, our team will help you keep your vehicle running exactly the way it should. We will also send helpful reminders so you never have to guess when service is due.\n\nThank you again for choosing {{dealership_name}}. We are excited to support you throughout your ownership journey.",
    recommended: true,
  },
  {
    id: "tpl-library-002",
    title: "7-Day Owner Check-In",
    description: "Follow up after delivery and answer early ownership questions.",
    lifecycleStage: "onboarding",
    templateType: "Onboarding",
    iconKey: "message-square",
    accentVariant: "sky",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Check in after delivery and make it easy for owners to ask questions.",
    draftNotes: "First-week follow-up to catch questions early and keep the dealership relationship warm.",
    draftContent:
      "Hi {{customer_name}}, it has been about a week since you took home your {{vehicle_model}}, and we wanted to check in.\n\nHow is everything going so far? If you have any questions about settings, technology, safety features, phone pairing, driver assistance, or anything else, our team is happy to help.\n\nWe want your first days of ownership to feel easy and supported. If there is anything you would like us to walk through with you, just reply and we can point you in the right direction or schedule a quick visit.\n\nThanks again for choosing {{dealership_name}}.",
    recommended: true,
  },
  {
    id: "tpl-library-003",
    title: "30-Day Feature Education",
    description: "Teach vehicle features and reinforce the value of staying connected.",
    lifecycleStage: "research-education",
    templateType: "Research & Education",
    iconKey: "sparkles",
    accentVariant: "amber",
    channels: ["email", "push"],
    previewMode: "email",
    previewSubject: "Helpful tips for getting more from your {{vehicle_model}}",
    previewContent:
      "Share helpful first-month ownership guidance and feature education.",
    draftNotes: "Educational touchpoint that keeps the relationship active even when there is no immediate service need.",
    draftContent:
      "Hi {{customer_name}}, now that you have had some time with your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}, this is a great moment to make sure you are getting the most out of it.\n\nMany owners still have questions after the first few weeks about connected features, driver profiles, app access, maintenance indicators, tire pressure monitoring, and convenience settings. If you would like help understanding any of those features, our team is happy to assist.\n\nWe can also help you prepare for your first routine maintenance visit so you know what to expect and when to plan for it.\n\nIf you want a quick walkthrough or have a question about your vehicle, reply to this message and our team will help.",
  },
  {
    id: "tpl-library-004",
    title: "First Service Reminder",
    description: "Prompt the first maintenance visit before momentum drops off.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "calendar",
    accentVariant: "emerald",
    channels: ["sms", "email", "push"],
    previewMode: "sms",
    previewContent:
      "Move new owners into their first recommended service visit.",
    draftNotes: "Move owners into their first scheduled service before they drift to an independent shop.",
    draftContent:
      "Hi {{customer_name}}, your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is approaching its first recommended service interval.\n\nStaying on schedule helps protect performance, maintain long-term reliability, and keep your ownership experience stress-free. Our certified technicians know your vehicle, use the right parts, and can help you stay ahead of wear before it becomes a larger issue.\n\nIf you would like, we can help you schedule your first service visit at {{dealership_name}} and find a time that works for you.\n\nReply to this message or contact us directly and we will get everything set up.",
    recommended: true,
  },
  {
    id: "tpl-library-005",
    title: "Deferred Maintenance Follow-Up",
    description: "Re-engage customers who declined recommended work during a visit.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "wrench",
    accentVariant: "teal",
    channels: ["sms", "email"],
    previewMode: "note",
    previewContent:
      "Bring customers back for recommended work they did not complete.",
    draftNotes: "Follow-up after a declined recommendation so the customer can return before the issue worsens.",
    draftContent:
      "Hi {{customer_name}}, during your recent visit we noted service recommendations that may still need attention on your {{vehicle_model}}.\n\nWe know it is not always convenient to take care of everything in one appointment, so we wanted to follow up and make it easy for you to come back when the timing works. Addressing recommended work sooner can help prevent bigger repairs, protect drivability, and reduce the chance of unexpected downtime.\n\nIf you would like to review the recommendations or schedule a follow-up visit with {{dealership_name}}, our team is ready to help.\n\nReply here and we can help you take the next step.",
    recommended: true,
  },
  {
    id: "tpl-library-006",
    title: "Seasonal Service Promotion",
    description: "Promote seasonal maintenance packages before demand spikes.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "badge-percent",
    accentVariant: "amber",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Seasonal service timing for your {{vehicle_model}}",
    previewContent:
      "Promote timely seasonal maintenance before demand starts to rise.",
    draftNotes: "Seasonal offer meant to create timely service demand and drive shop utilization.",
    draftContent:
      "Hi {{customer_name}}, this is a good time to get your {{vehicle_model}} ready for the season ahead.\n\nAt {{dealership_name}}, we are currently helping owners with seasonal service needs like battery checks, tire inspections, brake checks, fluid service, and general maintenance to keep vehicles performing reliably as weather and driving conditions change.\n\nIf you have been meaning to come in, now is a smart time to schedule and take care of routine service before demand increases.\n\nReply if you would like help booking a visit, and we will help you find the right appointment window.",
  },
  {
    id: "tpl-library-007",
    title: "Recall Outreach",
    description: "Move affected owners into fast recall scheduling with clear urgency.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "shield",
    accentVariant: "rose",
    channels: ["email", "sms"],
    previewMode: "sms",
    previewContent:
      "Alert affected owners and help them schedule recall repair quickly.",
    draftNotes: "Urgent but reassuring message focused on safety and ease of scheduling.",
    draftContent:
      "Hi {{customer_name}}, there is an open recall related to your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.\n\nYour safety is important to us, and the repair can be completed by our team at no cost to you. We want to make this process as easy and convenient as possible.\n\nIf you have not already scheduled the repair, please contact {{dealership_name}} so we can help you reserve a time and answer any questions you may have about the recall.\n\nReply to this message and we will help you get it handled quickly.",
    recommended: true,
  },
  {
    id: "tpl-library-008",
    title: "Warranty Expiration",
    description: "Surface coverage options before factory protection runs out.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "shield",
    accentVariant: "primary",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Your warranty coverage window is closing soon",
    previewContent:
      "Start a protection conversation before factory coverage expires.",
    draftNotes: "Protection-plan conversation timed before factory coverage expires.",
    draftContent:
      "Hi {{customer_name}}, the factory warranty on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is approaching expiration.\n\nBefore that coverage ends, this is a good time to think through your next step. Many owners choose to review protection options before expiration so they can avoid unexpected repair costs and keep peace of mind as they continue driving their vehicle.\n\nIf you would like to review service coverage options or talk through what makes the most sense for your ownership plans, the team at {{dealership_name}} can help.\n\nReply here and we will connect you with the right person.",
  },
  {
    id: "tpl-library-009",
    title: "Inactive Service Win-Back",
    description: "Reconnect with lapsed service customers before they churn for good.",
    lifecycleStage: "win-back-retention",
    templateType: "Win-Back & Retention",
    iconKey: "refresh",
    accentVariant: "teal",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Reconnect with inactive service customers before they fully churn.",
    draftNotes: "Reconnect with customers who have fallen out of the dealership service cadence.",
    draftContent:
      "Hi {{customer_name}}, it has been a little while since we last saw your {{vehicle_model}} at {{dealership_name}}, and we wanted to check in.\n\nIf your vehicle is due for maintenance, inspections, or any follow-up service, we would love the opportunity to take care of it for you. Our goal is to make service simple, transparent, and worth coming back for.\n\nIf there is anything your vehicle needs, or if you want help figuring out what is due next, reply to this message and our team will help you get scheduled.\n\nWe would be glad to welcome you back.",
    recommended: true,
  },
  {
    id: "tpl-library-010",
    title: "Lease-End Upgrade Check-In",
    description: "Open the conversation on renewal, purchase, or the next vehicle.",
    lifecycleStage: "win-back-retention",
    templateType: "Win-Back & Retention",
    iconKey: "car-front",
    accentVariant: "sky",
    channels: ["email", "sms"],
    previewMode: "note",
    previewContent:
      "Open an early conversation around lease-end or upgrade options.",
    draftNotes: "Pre-end-of-term outreach to restart the sales conversation while the customer relationship is still warm.",
    draftContent:
      "Hi {{customer_name}}, your current vehicle term is approaching an important decision point, and we wanted to reach out before the last-minute rush.\n\nWhether you are thinking about renewing, purchasing your current vehicle, or upgrading into something new, the team at {{dealership_name}} can help you review your options and make the process easier.\n\nPlanning early often gives you more flexibility, more time to compare choices, and a smoother transition into your next vehicle.\n\nIf you would like to talk through your options, reply here and we will help you get started.",
  },
  {
    id: "tpl-library-011",
    title: "Trade-Cycle Equity Opportunity",
    description: "Invite owners back when their vehicle value supports an upgrade.",
    lifecycleStage: "win-back-retention",
    templateType: "Win-Back & Retention",
    iconKey: "search",
    accentVariant: "emerald",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Your vehicle may be in a strong trade position",
    previewContent:
      "Invite owners back when their vehicle is in a strong trade position.",
    draftNotes: "Equity-led message designed to bring customers back into the showroom conversation.",
    draftContent:
      "Hi {{customer_name}}, based on the current market, your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} may be in a strong position for trade-in value.\n\nThat can create an opportunity to explore a vehicle upgrade while keeping your options open. If you have been considering something newer, different, or better aligned to your current needs, this may be a smart time to take a look.\n\nThe team at {{dealership_name}} can help you review current value, compare options, and decide whether a move makes sense.\n\nReply if you would like to start that conversation.",
  },
  {
    id: "tpl-library-012",
    title: "Post-Service Thank You & Review",
    description: "Reinforce a great visit and turn satisfaction into public reviews.",
    lifecycleStage: "research-education",
    templateType: "Research & Education",
    iconKey: "star",
    accentVariant: "primary",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Close the loop after service and encourage a review or follow-up.",
    draftNotes: "Closes the loop after a positive visit and encourages review behavior.",
    draftContent:
      "Hi {{customer_name}}, thank you for trusting {{dealership_name}} with service on your {{vehicle_model}}.\n\nWe appreciate the opportunity to take care of your vehicle, and we hope your recent visit felt smooth, helpful, and worth your time. Our team works hard to deliver a service experience that keeps you confident every time you come in.\n\nIf everything went well, we would be grateful if you shared your experience in a review. Feedback from customers like you helps others know what to expect and helps our team continue improving.\n\nThank you again for your business, and please reach out anytime you need us.",
  },
  {
    id: "tpl-library-013",
    title: "Pre-Visit Service Reminder",
    description:
      "Day-before confirmation with arrival tips, keys, and what to expect.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "calendar",
    accentVariant: "emerald",
    channels: ["sms", "email", "push"],
    previewMode: "sms",
    previewContent:
      "Confirm tomorrow’s appointment and set expectations for a smooth visit.",
    draftNotes:
      "Send the day before a booked service visit to reduce no-shows and front-desk friction.",
    draftContent:
      "Hi {{customer_name}}, this is a friendly reminder that your {{vehicle_model}} is scheduled for service at {{dealership_name}} soon.\n\nWhen you arrive, please bring your key fob and any relevant paperwork if we discussed a specific concern. If you use a loaner or shuttle, confirm the time window you selected so we can have everything ready.\n\nIf you are running late or need to reschedule, reply to this message and we will help you find another time.\n\nWe look forward to seeing you and taking care of your vehicle.",
    recommended: true,
  },
  {
    id: "tpl-library-014",
    title: "Express Lane Maintenance Invite",
    description:
      "Promote quick oil, filter, and rotation visits without an all-day commitment.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "wrench",
    accentVariant: "teal",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Invite owners in for fast routine maintenance when time is tight.",
    draftNotes:
      "Positions express or while-you-wait lanes for high-frequency maintenance work.",
    draftContent:
      "Hi {{customer_name}}, if you have been putting off routine maintenance on your {{vehicle_model}} because of a busy schedule, we have good news.\n\n{{dealership_name}} offers streamlined visits for common services like oil changes, filter replacements, tire rotations, and quick inspections. Our goal is to get you in, get the work done correctly, and get you back on the road without losing your whole day.\n\nIf you would like to book a quick service visit, reply here and we will help you grab a time that fits your calendar.\n\nKeeping up with routine maintenance is one of the easiest ways to protect long-term reliability.",
    recommended: true,
  },
  {
    id: "tpl-library-015",
    title: "Inspection Summary Follow-Up",
    description:
      "Explain multi-point findings in plain language and book honest next steps.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "search",
    accentVariant: "sky",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Your {{vehicle_model}} inspection summary from {{dealership_name}}",
    previewContent:
      "Follow up after an inspection with clarity, not pressure, on recommended work.",
    draftNotes:
      "Pairs with a digital or written inspection report; focuses on education and scheduling.",
    draftContent:
      "Hi {{customer_name}}, after your recent visit, our technicians completed a multi-point inspection on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.\n\nWe want you to understand what we saw, what is routine, and what may deserve attention over time. If anything was marked yellow or red, it does not always mean an emergency—it means we want you to have the information before it becomes a bigger issue.\n\nIf you have questions about the inspection notes or would like to schedule follow-up work on your timeline, reply to this message or contact {{dealership_name}}. We are happy to prioritize what matters most for your driving habits and budget.\n\nOur team is here to help you make informed decisions, not rushed ones.",
  },
  {
    id: "tpl-library-016",
    title: "Tire & Alignment Check-In",
    description:
      "Focus on tread, pressure, rotation, and alignment before wear accelerates.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "car-front",
    accentVariant: "amber",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Tire health check for your {{vehicle_model}}",
    previewContent:
      "Drive tire and alignment conversations with safety and even wear in mind.",
    draftNotes:
      "Narrow tire-specific campaign distinct from broad seasonal bundles.",
    draftContent:
      "Hi {{customer_name}}, tires are one of the most important safety systems on your {{vehicle_model}}, and small issues can turn into bigger expenses if they go unnoticed.\n\nThis is a great time to have us check tread depth, look for uneven wear patterns, verify inflation, rotate tires if it is due, and evaluate whether an alignment could improve handling and tire life.\n\nIf you have noticed pulling, vibration, or faster wear on one edge, mention it when you book so we can focus on the right diagnostics.\n\nReply if you would like {{dealership_name}} to schedule a tire and alignment check. We will help you understand what you need now versus what can wait.",
  },
  {
    id: "tpl-library-017",
    title: "Brake & Safety Inspection Invite",
    description:
      "Highlight brakes, fluids, and visibility before confidence on the road slips.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "shield",
    accentVariant: "rose",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Invite a brake and safety inspection when mileage or season suggests it.",
    draftNotes:
      "Safety-forward message; avoid implying a known defect unless true for that VIN.",
    draftContent:
      "Hi {{customer_name}}, if it has been a while since a technician reviewed the brakes and core safety items on your {{vehicle_model}}, this is a smart time to plan a visit.\n\nAt {{dealership_name}}, we can inspect brake friction material, fluid condition, hoses and lines, and related components, along with quick checks that affect visibility and control such as wipers and lights depending on what you need.\n\nCatching wear early often means simpler repairs, better pedal feel, and more predictable stopping in real-world driving.\n\nReply to schedule a brake and safety inspection, and tell us if you have noticed noise, pulsation, or a soft pedal so we can prioritize accordingly.",
  },
  {
    id: "tpl-library-018",
    title: "Genuine Accessories Conversation",
    description:
      "Introduce OEM-fit accessories and protection products without hard selling.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "sparkles",
    accentVariant: "primary",
    channels: ["email", "sms"],
    previewMode: "note",
    previewContent:
      "Open a helpful accessories dialogue tied to how the customer uses the vehicle.",
    draftNotes:
      "Soft upsell: cargo, weather, family, adventure; omit specific prices in the template.",
    draftContent:
      "Hi {{customer_name}}, many owners like to personalize their {{vehicle_model}} with accessories that make daily driving easier—think all-weather floor protection, roof or hitch solutions, cargo organizers, or upgraded lighting where available for your model.\n\nBecause genuine accessories are engineered for your vehicle, fitment and integration tend to be more predictable than one-size-fits-all alternatives.\n\nIf you are planning a road trip, winter weather, a growing family, or more gear-heavy weekends, reply and tell us how you use your vehicle. The team at {{dealership_name}} can suggest options that match your priorities.\n\nThere is no obligation—we are happy to be a resource while you decide what makes sense.",
  },
  {
    id: "tpl-library-019",
    title: "Extended & Weekend Service Hours",
    description:
      "Promote broader booking windows when the shop adds early, late, or Saturday time.",
    lifecycleStage: "service-revenue",
    templateType: "Service Promotions",
    iconKey: "calendar",
    accentVariant: "sky",
    channels: ["email", "push", "sms"],
    previewMode: "email",
    previewSubject: "More ways to service your {{vehicle_model}} at {{dealership_name}}",
    previewContent:
      "Let customers know when you offer extra hours so maintenance fits their week.",
    draftNotes:
      "Dealers should adjust copy to match real hours; template stays generic.",
    draftContent:
      "Hi {{customer_name}}, we know weekday schedules do not always leave room for vehicle service.\n\n{{dealership_name}} now highlights expanded scheduling options—including early, late, and weekend appointments where available—so you can maintain your {{vehicle_model}} without rearranging your whole week.\n\nIf you have been waiting for a better time window to handle maintenance, inspections, or follow-up work, reply to this message and we will help you find a slot that works.\n\nOur team will confirm the exact hours and services available when you book.",
  },
  {
    id: "tpl-library-020",
    title: "CPO & Used-Vehicle Welcome",
    description:
      "Welcome pre-owned buyers and set expectations for certification and service history.",
    lifecycleStage: "onboarding",
    templateType: "Onboarding",
    iconKey: "handshake",
    accentVariant: "teal",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Welcome to {{dealership_name}}—your {{vehicle_model}}",
    previewContent:
      "Onboard used and certified buyers with clarity on support and next service steps.",
    draftNotes:
      "Differentiate from new-car welcome; emphasize inspection, warranty where applicable, and trust.",
    draftContent:
      "Hi {{customer_name}}, welcome to {{dealership_name}}, and congratulations on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.\n\nWhether your vehicle is certified pre-owned or a quality used vehicle you chose with confidence, our service team is here to help you understand maintenance intervals, any remaining coverage, and how to keep everything documented for resale value down the road.\n\nIf you have questions about warning lights, service records, or what to plan for in the first few months, reply and we will point you in the right direction.\n\nWe are glad you trusted us with your purchase and we look forward to supporting you as an owner.",
  },
  {
    id: "tpl-library-021",
    title: "Service Convenience Overview",
    description:
      "Explain loaner vehicles, shuttle service, pickup and delivery, or waiting lounge perks.",
    lifecycleStage: "onboarding",
    templateType: "Onboarding",
    iconKey: "message-square",
    accentVariant: "emerald",
    channels: ["email", "push"],
    previewMode: "email",
    previewSubject: "How we make service easier at {{dealership_name}}",
    previewContent:
      "Make amenities visible so first-time service customers know their options.",
    draftNotes:
      "Dealer edits which amenities apply; keeps language inclusive if only some services exist.",
    draftContent:
      "Hi {{customer_name}}, when it is time to service your {{vehicle_model}}, we want the experience to feel straightforward—not disruptive to your day.\n\nDepending on what {{dealership_name}} offers, you may have access to options such as a courtesy shuttle, a comfortable waiting area with Wi-Fi, loaner vehicles for longer repairs, or pickup and delivery in select cases. Reply and ask what is available for your appointment type and we will outline the best fit.\n\nIf you need a specific accommodation, tell us when you book so we can plan ahead.\n\nOur goal is to remove friction so keeping your vehicle maintained feels realistic, not stressful.",
  },
  {
    id: "tpl-library-022",
    title: "Hybrid & EV Service Education",
    description:
      "Cover high-voltage safety, charging habits, and dealer service for electrified models.",
    lifecycleStage: "research-education",
    templateType: "Research & Education",
    iconKey: "sparkles",
    accentVariant: "emerald",
    channels: ["email", "push"],
    previewMode: "email",
    previewSubject: "Hybrid or EV ownership tips for your {{vehicle_model}}",
    previewContent:
      "Educate electrified owners on what factory-trained service covers and why it matters.",
    draftNotes:
      "Stays educational; avoids promising range or battery outcomes.",
    draftContent:
      "Hi {{customer_name}}, owning a hybrid or electric vehicle comes with a few differences compared with a traditional gas model, and we want you to feel confident about how {{dealership_name}} supports you.\n\nOur technicians train on high-voltage systems, battery cooling, software updates, and manufacturer-recommended inspections. Routine items like brakes, tires, and cabin filtration still matter, sometimes on different intervals than you expect.\n\nIf you are newer to charging at home or in public, or unsure which warning messages are urgent, reply with your question and we will help you sort it out.\n\nStaying on recommended service helps protect performance and safety as your {{vehicle_model}} ages.",
  },
  {
    id: "tpl-library-023",
    title: "Road Trip Readiness Check",
    description:
      "Offer a pre-trip inspection package narrative before long drives or holidays.",
    lifecycleStage: "research-education",
    templateType: "Research & Education",
    iconKey: "car-front",
    accentVariant: "amber",
    channels: ["email", "sms"],
    previewMode: "email",
    previewSubject: "Get your {{vehicle_model}} road-trip ready",
    previewContent:
      "Tie maintenance to an upcoming trip so owners plan service proactively.",
    draftNotes:
      "Occasion-based education; dealer can name peak travel seasons locally.",
    draftContent:
      "Hi {{customer_name}}, planning a long drive or holiday travel in your {{vehicle_model}}? A short pre-trip check can reduce the odds of surprises on the road.\n\nAt {{dealership_name}}, we can help you review tires, brakes, fluids, battery health, belts and hoses, lights, wipers, and climate performance—focused on what matters for highway miles and changing weather.\n\nIf you are towing or carrying a full load, mention that when you book so we can factor it into our recommendations.\n\nReply to schedule a road trip readiness visit. We will help you travel with more confidence and fewer what-if moments.",
  },
  {
    id: "tpl-library-024",
    title: "Mid-Ownership Milestone Check-In",
    description:
      "Reach owners around six to twelve months to reinforce habits and answer new questions.",
    lifecycleStage: "research-education",
    templateType: "Research & Education",
    iconKey: "star",
    accentVariant: "sky",
    channels: ["email", "sms"],
    previewMode: "sms",
    previewContent:
      "Check in mid-ownership when novelty fades but maintenance habits form.",
    draftNotes:
      "Complements 7-day and 30-day touches with a longer-horizon relationship pulse.",
    draftContent:
      "Hi {{customer_name}}, you have had your {{vehicle_model}} long enough to settle into a routine, and that is usually when new questions pop up.\n\nMaybe you are curious about maintenance timing, tire wear, software updates, or a feature you have not used yet. Whatever is on your mind, the team at {{dealership_name}} is here to help—no question is too small.\n\nIf you have not been in for service recently, we can also review what is coming due based on mileage and time.\n\nReply and tell us how ownership has been going. We would love to keep you on track for a smooth experience over the years ahead.",
  },
  {
    id: "tpl-library-025",
    title: "Customer Referral Invitation",
    description:
      "Invite happy customers to refer friends and family with a grateful, low-pressure tone.",
    lifecycleStage: "research-education",
    templateType: "Research & Education",
    iconKey: "handshake",
    accentVariant: "primary",
    channels: ["email", "sms"],
    previewMode: "note",
    previewContent:
      "Ask for referrals separately from public reviews; keep incentives optional and compliant.",
    draftNotes:
      "Legal/compliance teams should attach any formal referral program rules locally.",
    draftContent:
      "Hi {{customer_name}}, thank you for trusting {{dealership_name}} with your {{vehicle_model}} and your time.\n\nIf you have had a positive experience with our sales or service team, one of the kindest things you can do is tell a friend, neighbor, or coworker who is shopping or needs a reliable shop.\n\nWe grow mostly through relationships like yours, not loud advertising, and we take referrals seriously when someone you know reaches out.\n\nIf someone in your circle could use help, feel free to share our name—or reply here and we can make an introduction on your behalf.\n\nThere is no pressure; we appreciate you either way.",
  },
  {
    id: "tpl-library-026",
    title: "Missed Appointment Recovery",
    description:
      "Follow up after a no-show with empathy and easy rebooking options.",
    lifecycleStage: "win-back-retention",
    templateType: "Win-Back & Retention",
    iconKey: "refresh",
    accentVariant: "rose",
    channels: ["sms", "email"],
    previewMode: "sms",
    previewContent:
      "Reconnect after a missed appointment without guilt-tripping the customer.",
    draftNotes:
      "Distinct from long-term inactive win-back; assumes a specific missed slot.",
    draftContent:
      "Hi {{customer_name}}, we noticed you were not able to make your recent service appointment at {{dealership_name}} for your {{vehicle_model}}.\n\nLife gets busy—we completely understand. If you still need the work we discussed, or if something new has come up, reply to this message and we will help you rebook at a time that works better.\n\nIf you need to cancel future appointments, you can also let us know here so we can open the time for another customer.\n\nWe are here when you are ready, and we want taking care of your vehicle to feel easy.",
    recommended: true,
  },
  {
    id: "tpl-library-027",
    title: "Preferred Customer Stay-In-Touch",
    description:
      "Invite owners to a simple opt-in for service reminders, tips, and event news.",
    lifecycleStage: "win-back-retention",
    templateType: "Win-Back & Retention",
    iconKey: "badge-percent",
    accentVariant: "teal",
    channels: ["email", "push"],
    previewMode: "email",
    previewSubject: "Stay connected with {{dealership_name}}",
    previewContent:
      "Offer a light loyalty or communications opt-in without implying discounts.",
    draftNotes:
      "Framed as communication preferences; pair with real opt-in mechanics in product.",
    draftContent:
      "Hi {{customer_name}}, we would like to stay in touch about your {{vehicle_model}} in a way that actually helps—not clutters your inbox.\n\nIf you opt in to our preferred customer updates at {{dealership_name}}, you can receive timely service reminders, seasonal maintenance tips, and occasional news about clinic events or educational sessions when we host them.\n\nYou can change your mind anytime, and we will keep messages relevant to your vehicle and how you drive.\n\nReply if you would like us to add you to that list, or tell us which topics matter most to you so we only send what is useful.",
  },
];
