"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DesignSystemNav } from "./components/DesignSystemNav";
import { DesignSystemTemplate } from "./components/DesignSystemTemplate";
import { getDesignSystemEntry, renderDesignSystemEntry } from "./design-system-registry";
import { buildDesignSystemItemHref, type DesignSystemGroup } from "./design-system-routes";

export interface DesignSystemItemPageProps {
  group: DesignSystemGroup;
  slug: string;
}

export function DesignSystemItemPage({ group, slug }: DesignSystemItemPageProps) {
  const router = useRouter();
  const entry = getDesignSystemEntry(group, slug);

  useEffect(() => {
    if (entry?.canonicalSlug != null && entry.canonicalSlug !== slug) {
      router.replace(buildDesignSystemItemHref(group, entry.canonicalSlug));
    }
  }, [entry?.canonicalSlug, group, router, slug]);

  if (entry == null) {
    return (
      <DesignSystemTemplate left={<DesignSystemNav />}>
        <p className="text-sm text-muted-foreground">Try selecting an item from the left navigation.</p>
      </DesignSystemTemplate>
    );
  }

  const content = renderDesignSystemEntry(group, entry.slug);
  if (content == null) {
    return null;
  }

  return (
    <DesignSystemTemplate left={<DesignSystemNav />}>
      {content}
    </DesignSystemTemplate>
  );
}
