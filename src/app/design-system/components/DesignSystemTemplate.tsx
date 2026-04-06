"use client";

export interface DesignSystemTemplateProps {
  children: React.ReactNode;
  /** Optional left nav (e.g. DesignSystemNav). When provided, layout is two-column: nav + main. */
  left?: React.ReactNode;
  /** Optional page-level top bar (e.g. app TopBar component). */
  topBar?: React.ReactNode;
}

export function DesignSystemTemplate({ children, left, topBar }: DesignSystemTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {left != null && left}
        <div className="flex min-w-0 flex-1 flex-col">
          {topBar}
          <main className="min-w-0 flex-1 overflow-auto px-8 pb-10 pt-6">
            <div className="mx-auto w-full max-w-[952px] space-y-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
