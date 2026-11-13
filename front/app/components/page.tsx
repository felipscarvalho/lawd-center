import type { Metadata } from "next";
import { ComponentShowcase } from "./_components/component_showcase";

export const metadata: Metadata = {
  title: "Componentes",
  description: "Vitrine dos componentes base do Untitled UI",
};

export default function ComponentsPage() {
  return <ComponentShowcase />;
}
