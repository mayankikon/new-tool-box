"use client";

import { ProductWorkspace } from "@/components/app/product-workspace";

/**
 * Shared shell for all product URLs. Layout persists across navigations so
 * in-memory UI state (e.g. campaign wizard) survives client-side route changes.
 */
export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProductWorkspace />
      {children}
    </>
  );
}
