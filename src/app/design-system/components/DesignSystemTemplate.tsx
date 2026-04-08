"use client";

export interface DesignSystemTemplateProps {
  children: React.ReactNode;
  /** Optional left nav (e.g. DesignSystemNav). When provided, layout is two-column: nav + main. */
  left?: React.ReactNode;
  /** Optional page-level title bar (e.g. app TitleBar component). */
  topBar?: React.ReactNode;
}

export function DesignSystemTemplate({ children, left, topBar }: DesignSystemTemplateProps) {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background text-foreground">
      {left != null && left}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-neutral-50 dark:bg-background">
        {topBar}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-8 pb-10 pt-6">
          <div className="mx-auto w-full max-w-[952px] space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
