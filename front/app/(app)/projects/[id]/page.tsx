import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/layout/query_states";
import { ProjectDetail } from "./_components/project_detail";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Projeto | Lawd Center",
};

// O id vem da URL (useParams), que só é conhecido na requisição: precisa de um Suspense em volta
export default function ProjectPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando projeto..." />}>
      <ProjectDetail />
    </Suspense>
  );
}
