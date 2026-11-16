"use client";

import { useState } from "react";
import { XClose } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { toast } from "@/components/feedback/toast";
import { ProfilePhotoButton } from "@/components/administration/profile_photo_button";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { useRemoveProfilePhoto } from "@/hooks/administration/use_profiles";
import { getInitials } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import type { Profile } from "@/types/administration";

interface ProfilePhotoEditorProps {
  profile: Profile;
  /** Mostra os botões de enviar e remover (a própria pessoa ou quem pode editar o perfil) */
  canEdit: boolean;
}

/** Foto do perfil em quadro grande (iniciais sem foto), com enviar e remover para quem pode editar */
export function ProfilePhotoEditor({ profile, canEdit }: ProfilePhotoEditorProps) {
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

        {canEdit && profile.photoUrl && (
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

      {canEdit && (
        <>
          <ProfilePhotoButton userId={profile.user.id} hasPhoto={Boolean(profile.photoUrl)} />
          <p className="text-center text-xs text-tertiary">JPG, PNG ou WebP, até 5 MB</p>
        </>
      )}

      <ConfirmModal
        isOpen={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        title="Remover foto?"
        description="O avatar volta a mostrar as iniciais do nome."
        confirmLabel="Remover"
        onConfirm={confirmRemove}
        isConfirming={removePhoto.isPending}
      />
    </div>
  );
}
