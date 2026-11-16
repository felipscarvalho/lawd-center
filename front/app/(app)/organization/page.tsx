import type { Metadata } from "next";
import { OrganizationChart } from "./_components/organization_chart";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Organograma | Lawd Center",
};

export default function OrganizationPage() {
  return <OrganizationChart />;
}
