import type { Metadata } from "next";
import { InvitationForm } from "./_components/invitation_form";

// O token vem da URL e o convite é conferido na API pelo navegador: fora da validação de instant navigation
export const instant = false;

export const metadata: Metadata = {
  title: "Criar senha | Lawd Center",
};

export default function InvitationPage() {
  return <InvitationForm />;
}
