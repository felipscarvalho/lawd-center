"use client";

import { useState } from "react";
import { XClose } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { toast } from "@/components/feedback/toast";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { ProfilePhotoButton } from "@/components/administration/profile_photo_button";
import { useRemoveProfilePhoto } from "@/hooks/administration/use_profiles";
import { getInitials } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import type { Profile } from "@/types/administration";
import { ChangePasswordForm } from "./change_password_form";

/** Coluna da conta: foto (enviar e remover) e troca de senha */
export function AccountCard({ profile }: { profile: Profile }) {
  const removePhoto = useRemoveProfilePhoto(profile.user.id);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const confirmRemove = () => {
    removePhoto.mutate(undefined, {
      onSuccess: () => {
        toast.success("Foto removida");
        setIsRemoveOpen(false);
      },
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <aside className="flex flex-col gap-6 border-b border-secondary p-5 sm:p-6 lg:border-r lg:border-b-0">
      <h2 className="text-md font-semibold text-primary">Conta</h2>

      <div className="flex flex-col gap-3">
        <div className="relative mx-auto aspect-square w-full max-w-60 overflow-hidden rounded-xl bg-brand-solid/10 ring-1 ring-secondary lg:max-w-72">
          {profile.photoUrl ? (
            // Foto já comprimida pelo backend (WebP 512×512); não passa pelo otimizador do Next
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoUrl} alt={profile.user.fullName} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-display-lg font-semibold text-brand-tertiary">
              {getInitials(profile.user.fullName)}
            </span>
          )}

          {profile.photoUrl && (
            <ButtonUtility
              size="sm"
              color="secondary"
              icon={XClose}
              tooltip="Remover foto"
              aria-label="Remover foto"
              className="absolute top-3 right-3"
              onClick={() => setIsRemoveOpen(true)}
            />
          )}
        </div>

        <ProfilePhotoButton userId={profile.user.id} hasPhoto={Boolean(profile.photoUrl)} />
        <p className="text-center text-xs text-tertiary">JPG, PNG ou WebP, até 5 MB</p>
      </div>

      <ChangePasswordForm />

      <ConfirmModal
        isOpen={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        title="Remover foto?"
        description="Seu avatar volta a mostrar as iniciais do nome."
        confirmLabel="Remover"
        onConfirm={confirmRemove}
        isConfirming={removePhoto.isPending}
      />
    </aside>
  );
}
