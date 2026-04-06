import { DesignSystemItemPage } from "../../design-system-item-page";

interface ComponentsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComponentsPage({ params }: ComponentsPageProps) {
  const { slug } = await params;
  return <DesignSystemItemPage group="components" slug={slug} />;
}
