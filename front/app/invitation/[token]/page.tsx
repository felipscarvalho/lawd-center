import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/layout/query_states";
import { InvitationForm } from "./_components/invitation_form";

// O token vem da URL e o convite é conferido na API pelo navegador: fora da validação de instant navigation
export const instant = false;

export const metadata: Metadata = {
  title: "Criar senha | Lawd Center",
};

// O token vem da URL (useParams), que só é conhecido na requisição: precisa de um Suspense em volta
export default function InvitationPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando convite..." />}>
      <InvitationForm />
    </Suspense>
  );
}
