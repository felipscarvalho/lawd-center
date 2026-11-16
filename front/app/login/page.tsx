import type { Metadata } from "next";
import { LoginForm } from "./_components/login_form";

export const metadata: Metadata = {
  title: "Entrar | Lawd Center",
};

export default function LoginPage() {
  return <LoginForm />;
}
