# Stepper — Sort UI 1.3 Figma parity spec

This document records the **implementation contract** for stepper components aligned with [Sort UI — 1.3 Playground](https://www.figma.com/design/SWdPHuoLpCP03Ottx8g5GT/Sort-UI-%E2%80%94-1.3-Playground). Use it when updating tokens or re-running visual QA.

**Figma file key:** `SWdPHuoLpCP03Ottx8g5GT`

| Node ID     | URL fragment   | Intended coverage (verify in Figma)        |
| ----------- | -------------- | -------------------------------------------- |
| `13824:79411` | `13824-79411`  | Horizontal stepper variant 1                 |
| `13824:79653` | `13824-79653`  | Horizontal stepper variant 2                 |
| `13824:79869` | `13824-79869`  | Horizontal stepper variant 3                 |
| `13824:79617` | `13824-79617`  | Vertical / composition variant               |
| `13824:80171` | `13824-80171`  | Indicator / connector primitive or density   |
| `13824:80100` | `13824-80100`  | Additional stepper state or layout           |

> **Note:** If Figma Desktop MCP (`get_design_context`) cannot resolve nodes, open each frame in the Figma app and refresh spacing/color values in the table below.

## Design tokens (code implementation)

Values below match **Toolbox** theme primitives in [`src/app/theme-primitives.css`](../../src/app/theme-primitives.css) and the **campaign wizard** reference in [`src/components/campaigns/wizard/wizard-stepper.tsx`](../../src/components/campaigns/wizard/wizard-stepper.tsx).

### StepperIndicator

| Status    | Fill / border | Text / icon                         |
| --------- | ------------- | ----------------------------------- |
| completed | `primary`     | `primary-foreground` (white) + check |
| active    | `background`  | `primary` / `--theme-text-interactive`, `border-2 border-primary` |
| upcoming  | `--theme-background-container` | `--theme-text-tertiary`, `border` `--theme-stroke-default` |

| Size | Dimensions |
| ---- | ---------- |
| sm   | 24×24 px (`size-6`, `box-border`) |
| md   | 40×40 px (`size-10`, `box-border`) |

### StepperConnector

| State     | Color |
| --------- | ----- |
| default   | `--theme-stroke-default` |
| completed | `primary` (same as filled progress in wizard) |

| Orientation | Thickness | Min flex segment |
| ----------- | --------- | ---------------- |
| horizontal  | 1 px      | `min-w-4` (16 px) |
| vertical    | 1 px      | `min-h-4` (16 px) |

### Segment completion (horizontal)

For step index `i` (0-based) and **active** step index `currentStep`:

- **Segment after step `i`** (trailing connector on item `i`): filled iff `i < currentStep` (step `i` is **completed**).
- **Segment before step `i`** (leading connector on item `i`): filled iff `i > 0 && i <= currentStep` (segment from `i-1` to `i` is done).

Vertical connector **below** step `i`: filled iff `i < currentStep` ⇔ status is `completed` (unchanged).

### Typography & layout

| Element      | Spec |
| ------------ | ---- |
| Step label   | 16 px / 24 px line, font-medium, `--theme-text-primary` |
| Caption      | 14 px / 20 px line, `--theme-text-secondary` |
| Support text | 14 px / 20 px line, `--theme-text-secondary`, trailing on row |
| Horizontal: label block ↔ indicator row | 16 px (`gap-4`) |
| Horizontal: indicator ↔ connector       | 8 px (`gap-2`) |
| Vertical: rail ↔ content                | 24 px (`gap-6`) |
| Vertical: content stack                 | 12 px (`gap-3`) |

## Regression checklist

- [ ] Design system `#stepper` matches six linked frames at 100% zoom.
- [ ] Light and `.dark` themes: indicator and connector contrast.
- [ ] [`campaign-wizard-v2.tsx`](../../src/components/campaigns-v2/campaign-wizard-v2.tsx) horizontal stepper: segment fill stops at active step (no line past current).
