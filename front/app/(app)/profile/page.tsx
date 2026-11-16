import type { Metadata } from "next";
import { MyProfile } from "./_components/my_profile";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Meu perfil | Lawd Center",
};

export default function ProfilePage() {
  return <MyProfile />;
}
