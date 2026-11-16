"use client";

import { ProfilePhotoEditor } from "@/components/administration/profile_photo_editor";
import type { Profile } from "@/types/administration";
import { ChangePasswordForm } from "./change_password_form";

/** Coluna da conta: foto (enviar e remover) e troca de senha */
export function AccountCard({ profile }: { profile: Profile }) {
  return (
    <aside className="flex flex-col gap-6 border-b border-secondary p-5 sm:p-6 lg:border-r lg:border-b-0">
      <h2 className="text-md font-semibold text-primary">Conta</h2>

      <ProfilePhotoEditor profile={profile} canEdit />

      <ChangePasswordForm />
    </aside>
  );
}
