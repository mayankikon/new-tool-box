/**
 * Workspace routes are resolved inside ProductWorkspace via pathname.
 * Required catch-all (not optional) so `/` is only the root redirect in `src/app/page.tsx`
 * and every in-app path has at least one segment (`/customers`, `/inventory/dashboard`, …).
 */
export default function WorkspaceCatchAllPage() {
  return null;
}
