import type { Metadata } from "next";
import { UsersList } from "./_components/users_list";

// Página da área logada (só existe no navegador): fora da validação de instant navigation, ver app/(app)/layout.tsx
export const instant = false;

export const metadata: Metadata = {
  title: "Usuários | Lawd Center",
};

export default function UsersPage() {
  return <UsersList />;
}
