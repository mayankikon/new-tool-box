import Link from "next/link";

interface PlaygroundQueuedStubProps {
  label: string;
  slug: string;
}

/**
 * Shown for design-system components that do not have a live retro playground yet.
 */
export function PlaygroundQueuedStub({ label, slug }: PlaygroundQueuedStubProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8">
      <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No live playground for <code className="text-xs">{slug}</code> yet. It is listed in the{" "}
        <strong>component matrix</strong> and/or <strong>app extractables</strong> in{" "}
        <code className="text-xs">docs/design-system-retro-audit.md</code> so we can prioritize
        retro variants and DialKit tuners.
      </p>
      <ul className="mt-4 list-inside list-disc text-sm text-muted-foreground space-y-1">
        <li>Check the matrix for retro fit (P0–P2) and source files.</li>
        <li>Feature modules (campaigns, inventory, etc.) are in § App-wide extractables.</li>
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/design-system" className="text-primary underline underline-offset-2">
          Open design system reference →
        </Link>
      </p>
    </div>
  );
}
