# Decision: Phosphor icons for app shell sidebar — **superseded**

**Date:** 2026-03-21  
**Status:** Reverted (2026-03-21)

## Outcome

The app shell sidebar again uses **`lucide-react`** for all nav, product switcher, and chrome icons (`LucideIcon` on `SidebarNavItemConfig` / `SidebarProductConfig`), matching shadcn’s `components.json` `iconLibrary: lucide`. **`@phosphor-icons/react`** was removed from dependencies.

Phosphor had been adopted for outline/fill weights and primary-colored active icons; we reverted for product preference.

## Current implementation

- `src/components/ui/sidebar.tsx`
- `src/app/page.tsx` (nav + product definitions)
- `src/app/design-playground/showcases/page-layout-chrome-showcase.tsx`
