import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/layout/query_states";
import { UserDetail } from "./_components/user_detail";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Usuário | Lawd Center",
};

// O id vem da URL (useParams), que só é conhecido na requisição: precisa de um Suspense em volta
export default function UserPage() {
  return (
    <Suspense
      fallback={<LoadingState label="Carregando usuário..." />}
    >
      <UserDetail />
    </Suspense>
  );
}
