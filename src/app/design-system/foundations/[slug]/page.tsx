import { DesignSystemItemPage } from "../../design-system-item-page";

interface FoundationsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FoundationsPage({ params }: FoundationsPageProps) {
  const { slug } = await params;
  return <DesignSystemItemPage group="foundations" slug={slug} />;
}
