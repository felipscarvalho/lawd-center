import type { Metadata } from "next";
import { ProjectsAnalytics } from "./_components/projects_analytics";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Análise de projetos | Lawd Center",
};

export default function ProjectsAnalyticsPage() {
  return <ProjectsAnalytics />;
}
