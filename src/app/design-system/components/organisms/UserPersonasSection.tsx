"use client";

import { useState } from "react";
import { MapPin, TrendingDown, ShieldCheck, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "../atoms/SectionTitle";

interface PersonaSignal {
  label: string;
}

interface Persona {
  id: string;
  icon: React.ReactNode;
  name: string;
  tagline: string;
  accentClass: string;
  iconBgClass: string;
  borderClass: string;
  activeBgClass: string;
  switchActiveClass: string;
  signals: PersonaSignal[];
  goal: string;
  discountPolicy: string;
  primaryTrigger: string;
  badgeTone: "green" | "amber" | "red" | "blue";
}

const PERSONAS: Persona[] = [
  {
    id: "loyalist",
    icon: <ShieldCheck className="size-5" />,
    name: "The Loyalist",
    tagline: "Consistently returns — protect margin, pursue upsell.",
    accentClass: "text-emerald-600",
    iconBgClass: "bg-emerald-50 text-emerald-600",
    borderClass: "border-emerald-200",
    activeBgClass: "bg-emerald-50/60",
    switchActiveClass: "bg-emerald-600 text-white shadow-sm",
    badgeTone: "green",
    signals: [
      { label: "Regular service cadence" },
      { label: "Low days-since-last-service" },
      { label: "High marketing engagement" },
      { label: "Consistent mileage pattern" },
    ],
    goal: "Trade-in offer, new vehicle, loyalty reward",
    discountPolicy: "No service discounts — save budget for vehicle offers",
    primaryTrigger: "Mileage milestone or vehicle age (3–4 years)",
  },
  {
    id: "at-risk",
    icon: <TrendingDown className="size-5" />,
    name: "At-Risk",
    tagline: "Gone quiet or oil-change-only — re-engage before they defect.",
    accentClass: "text-amber-600",
    iconBgClass: "bg-amber-50 text-amber-600",
    borderClass: "border-amber-200",
    activeBgClass: "bg-amber-50/60",
    switchActiveClass: "bg-amber-500 text-white shadow-sm",
    badgeTone: "amber",
    signals: [
      { label: "6–18 months since last visit" },
      { label: "Oil-change-only visit pattern" },
      { label: "Declining message engagement" },
      { label: "No bigger repair visits" },
    ],
    goal: "Re-engage before full defection",
    discountPolicy: "Moderate coupon — $20–$40 off service",
    primaryTrigger: "Days-since-last-service threshold or engagement score drop",
  },
  {
    id: "defecting",
    icon: <MapPin className="size-5" />,
    name: "Actively Defecting",
    tagline: "Visiting a competitor — send an aggressive win-back offer next morning.",
    accentClass: "text-rose-600",
    iconBgClass: "bg-rose-50 text-rose-600",
    borderClass: "border-rose-200",
    activeBgClass: "bg-rose-50/60",
    switchActiveClass: "bg-rose-600 text-white shadow-sm",
    badgeTone: "red",
    signals: [
      { label: "10+ min in indie repair geofence" },
      { label: "Confirmed by location data" },
      { label: "Service gap in history" },
      { label: "Low recent engagement" },
    ],
    goal: "Win back with a high-value offer",
    discountPolicy: "Aggressive coupon — free oil change or $75+ off",
    primaryTrigger: "Geofence dwell event → message sent next morning",
  },
  {
    id: "relocated",
    icon: <Navigation className="size-5" />,
    name: "Relocated",
    tagline: "Moved far from original dealership — warm handoff to nearest sister store.",
    accentClass: "text-sky-600",
    iconBgClass: "bg-sky-50 text-sky-600",
    borderClass: "border-sky-200",
    activeBgClass: "bg-sky-50/60",
    switchActiveClass: "bg-sky-600 text-white shadow-sm",
    badgeTone: "blue",
    signals: [
      { label: ">30 mi drift from home dealership" },
      { label: "2–3 confirmed location data points" },
      { label: "Visit frequency unchanged" },
    ],
    goal: "Refer to nearest sister dealership in group",
    discountPolicy: "No discount — this is a referral, not a win-back",
    primaryTrigger: "Location drift detected after 2–3 data points",
  },
];

function PersonaDetail({ persona }: { persona: Persona }) {
  return (
    <div
      className={`rounded-lg border ${persona.borderClass} ${persona.activeBgClass} flex flex-col gap-5 p-6 shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${persona.iconBgClass}`}>
          {persona.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-base font-semibold ${persona.accentClass}`}>{persona.name}</h3>
          <p className="ds-doc-font mt-0.5 text-sm text-muted-foreground leading-snug">{persona.tagline}</p>
        </div>
      </div>

      {/* Signals */}
      <div>
        <p className="ds-doc-font mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Signals
        </p>
        <div className="flex flex-wrap gap-1.5">
          {persona.signals.map((s) => (
            <Badge key={s.label} variant="soft" tone={persona.badgeTone} size="sm" shape="pill">
              {s.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-background/70 p-3">
          <p className="ds-doc-font mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Goal
          </p>
          <p className="ds-doc-font text-sm text-foreground">{persona.goal}</p>
        </div>
        <div className="rounded-md bg-background/70 p-3">
          <p className="ds-doc-font mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Discount policy
          </p>
          <p className="ds-doc-font text-sm text-foreground">{persona.discountPolicy}</p>
        </div>
        <div className="rounded-md bg-background/70 p-3">
          <p className="ds-doc-font mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Primary trigger
          </p>
          <p className="ds-doc-font text-sm text-foreground">{persona.primaryTrigger}</p>
        </div>
      </div>
    </div>
  );
}

export function UserPersonasSection() {
  const [activeId, setActiveId] = useState<string>(PERSONAS[0].id);
  const activePersona = PERSONAS.find((p) => p.id === activeId) ?? PERSONAS[0];

  return (
    <section id="user-personas" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Patterns"
        title="User Personas"
        description="Four retention personas derived from location, VIN, service history, and behavioral signals. Each customer holds one base state; proximity and lifecycle triggers layer on top independently."
      />

      {/* Persona Switch */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-1.5">
        {PERSONAS.map((persona) => {
          const isActive = persona.id === activeId;
          return (
            <button
              key={persona.id}
              onClick={() => setActiveId(persona.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? `${persona.switchActiveClass}`
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              }`}
            >
              <span className="size-4 shrink-0">{persona.icon}</span>
              {persona.name}
            </button>
          );
        })}
      </div>

      {/* Active Persona Detail */}
      <PersonaDetail persona={activePersona} />
    </section>
  );
}
