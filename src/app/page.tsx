import { redirect } from "next/navigation";

import { DEFAULT_WORKSPACE_PATH } from "@/lib/app-nav/workspace-routes";

export default function HomePage() {
  redirect(DEFAULT_WORKSPACE_PATH);
}
