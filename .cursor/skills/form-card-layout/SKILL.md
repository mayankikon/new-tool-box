---
name: form-card-layout
description: >-
  Applies the portfolio form-card layout used on Inventory Customers → Register
  Customer: custom sidebar-toned card surface, two-column FormSection (title +
  description | fields), InputGroup field stack, lg inputs, and Select height
  alignment. Use when building or refactoring full-page or panel forms to match
  register-customer-page.tsx spacing, typography, and input hierarchy; or when
  the user asks for the same card/form pattern as customer registration.
---

# Form card layout (Register Customer pattern)

Reference implementation: `src/components/customers/register-customer-page.tsx`.

## Goals

- One **card surface** per logical form (not repeated shadcn `Card` per subsection unless the product explicitly wants multiple cards).
- **Section titles** and **helper copy** sit in a **left column**; **controls** sit in a **right column** on large screens.
- **Inputs** always use the **InputGroup** stack with **lg** sizing for primary fields.
- **Select** triggers match **Input** row height (36px).

## Card surface

Use a `section` (or single wrapper) with this Tailwind string — **not** the default shadcn `Card` for this pattern:

```txt
rounded-md border border-sidebar-border bg-sidebar p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]
```

Name it e.g. `CARD_SURFACE_CLASS` and combine with `cn(..., "w-full min-w-0")`.

## FormSection — two-column grid

**Full-width pages** (e.g. Register Customer) can use fixed columns when space allows:

```tsx
className="grid gap-5 lg:grid-cols-[480px_600px] lg:justify-between lg:items-start"
```

**Narrow panes** (e.g. editor column next to a phone preview) should use **fluid** columns so the grid does not overflow:

```tsx
className="grid gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:justify-between lg:items-start"
```

**Left column** (title + description):

```tsx
<header className="min-w-0 space-y-1.5">
  <h2 className="text-base font-medium leading-snug text-foreground">{title}</h2>
  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
</header>
```

**Right column** (fields):

```tsx
<div className="min-w-0 w-full space-y-4">{children}</div>
```

## Vertical rhythm inside the card

Stack multiple `FormSection` blocks with **`gap-12`** inside the card:

```tsx
<section className={cn(CARD_SURFACE_CLASS, "w-full min-w-0")}>
  <div className="flex flex-col gap-12">
    <FormSection ... />
    <FormSection ... />
  </div>
</section>
```

## Input field stack

From `@/components/ui/input`:

1. `InputGroup` (optional `className="group"` for label disabled styling)
2. `InputLabel` with `htmlFor` pointing at the control `id`
3. `InputContainer size="lg"`
4. `Input` with `standalone={false}` and `size="lg"`

Do **not** use bare `Label` + `Input` with `space-y-1` for primary fields.

**Helper text** below a field: `InputHelperText`.

## Select alignment

`SelectTrigger` default height is shorter than `InputContainer` **lg**. Match **register-customer-page** with:

```tsx
const SELECT_TRIGGER_LG_HEIGHT =
  "box-border !h-9 min-h-9 max-h-9 shrink-0 px-2.5 py-0 text-sm leading-none data-[size=default]:!h-9 data-[size=default]:min-h-9 data-[size=default]:max-h-9";

const SELECT_ROW_CLASS = cn(
  SELECT_TRIGGER_LG_HEIGHT,
  "w-full min-w-0 items-center",
);

<SelectTrigger size="default" className={SELECT_ROW_CLASS} id={...}>
```

`Select` used without `InputContainer` still sits inside `InputGroup` with `InputLabel` above it.

## Multi-field rows

- **Two fields**: `grid grid-cols-2 gap-4` wrapping two `InputGroup`s.
- **Three fields** (e.g. city / state / zip): `grid grid-cols-1 gap-4 sm:grid-cols-3`.

## Textarea

There is no `TextareaContainer` in this repo. Use `InputGroup` + `InputLabel` + **`Textarea`** (standalone bordered textarea matches design system).

## Toggles (Switch) and inline choices

**Switch + `Label`** for `htmlFor` is fine (same idea as checkbox/radio rows on Register Customer). Keep `flex items-center gap-2`.

## Page scroll area

Main column scroll region: **`px-8 pb-8 pt-6`** (see `.cursor/rules/layout-spacing.mdc`). Do not double-wrap horizontal padding with a parent that already applies `px-8`.

## Anti-patterns

- Stacking many shadcn **`Card`** components for each subsection when the product wants a **single** register-style form surface.
- **`Input`** default **standalone** border inside a form that already uses **`InputContainer`**.
- **`Label`** with `text-xs`** for fields that should match **InputLabel** (`text-sm font-medium`).
