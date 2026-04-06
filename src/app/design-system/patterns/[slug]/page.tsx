import { DesignSystemItemPage } from "../../design-system-item-page";

interface PatternsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PatternsPage({ params }: PatternsPageProps) {
  const { slug } = await params;
  return <DesignSystemItemPage group="patterns" slug={slug} />;
}
