# Decision: Campaign sequence map canvas vs canonical sequence logic

**Date:** 2026-03-26

## Context

Campaign automation in the wizard is configured with **`CampaignSequenceLogic`** (response rules, no-response rules, offer escalations, goal, presets). The app derives a graph-shaped **`CampaignWorkflow`** (`nodes` / `edges`) for visualization and validation via **`deriveWorkflowFromSequenceLogic`**.

## Decision

- **`CampaignSequenceLogic` remains the source of truth** for branching behavior. The wizard continues to validate and persist this structure.
- **`CampaignWorkflow` is derived**, not independently edited as a free-form graph. Canvas actions (add/remove rules, inspector edits) mutate `sequenceLogic` (and related wizard fields); the graph is recomputed on each update.
- **Node identity for editing**: `WorkflowNode` carries optional **`sourceResponseRuleId`**, **`sourceNoResponseRuleId`**, and **`sourceOfferEscalationId`** so the sequence map can open the correct inspector for a rule row. Condition and escalation nodes use stable ids based on rule ids (not merge order indices).
- **Layout**: **`workflowNodeLayout`** on wizard form data stores user-dragged `{ x, y }` positions keyed by node id. It is presentation-only and merged with auto-layout via **`mergeWorkflowLayout`**.
- **UX**: The canvas uses a Zapier-style presentation (add-step menu, live drag with **`flushSync`**, connector lines) while still mapping only to sequence-logic concepts; see **`workflow-canvas-view.ts`** for display mapping.

## Consequences

- Adding arbitrary nodes only through the canvas without a corresponding sequence-logic concept would require a schema change; the product stays aligned with the existing rule model until then.
