import type { Metadata } from "next";
import { DirectoratesList } from "./_components/directorates_list";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Diretorias | Lawd Center",
};

export default function DirectoratesPage() {
  return <DirectoratesList />;
}
