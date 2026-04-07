import { redirect } from "next/navigation";

import { buildDesignSystemItemHref } from "@/app/design-system/design-system-routes";

export default function ColorPage() {
  redirect(buildDesignSystemItemHref("foundations", "colors"));
}
