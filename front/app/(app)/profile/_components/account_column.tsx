"use client";

import { ProfilePhotoEditor } from "@/components/administration/profile_photo_editor";
import type { Profile } from "@/types/administration";
import { ChangePasswordForm } from "./change_password_form";

/** Coluna da conta em Meu perfil: foto (enviar e remover) e troca de senha */
export function AccountColumn({ profile }: { profile: Profile }) {
  return (
    <>
      <h2 className="text-md font-semibold text-primary">Conta</h2>

      <ProfilePhotoEditor profile={profile} canEdit />

      <ChangePasswordForm />
    </>
  );
}
