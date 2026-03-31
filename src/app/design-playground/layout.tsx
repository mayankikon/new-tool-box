import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./retro-playground.css";

export const metadata: Metadata = {
  title: "Design playground — retro dash experiments",
  description:
    "Experimental skeuomorphic variants of design-system components (automotive / dash aesthetic).",
};

export default function DesignPlaygroundLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
