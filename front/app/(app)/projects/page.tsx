import type { Metadata } from "next";
import { ProjectsList } from "./_components/projects_list";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Projetos | Lawd Center",
};

export default function ProjectsPage() {
  return <ProjectsList />;
}
