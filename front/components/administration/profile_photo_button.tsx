"use client";

import { FileTrigger } from "react-aria-components";
import { UploadCloud02 } from "@untitledui/icons";
import { Button, type ButtonProps } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { useUploadProfilePhoto } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";

// Mesma regra do validator do backend, que depois comprime a foto para WebP 512×512
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 5 * 1024 * 1024;

const getPhotoError = (photo: File) => {
  if (!acceptedTypes.includes(photo.type)) return "Envie uma imagem JPG, PNG ou WebP.";
  if (photo.size > maxSize) return "A imagem pode ter no máximo 5 MB.";

  return null;
};

interface ProfilePhotoButtonProps {
  userId: number;
  hasPhoto: boolean;
  size?: ButtonProps["size"];
  className?: string;
}

/** Botão que abre o seletor de arquivo, confere a imagem no navegador e envia a foto do perfil */
export function ProfilePhotoButton({ userId, hasPhoto, size, className }: ProfilePhotoButtonProps) {
  const uploadPhoto = useUploadProfilePhoto(userId);

  const handleSelect = (files: FileList | null) => {
    const photo = files?.[0];

    if (!photo) return;

    const photoError = getPhotoError(photo);

    if (photoError) {
      toast.error("Não foi possível usar esta imagem", { description: photoError });
      return;
    }

    uploadPhoto.mutate(photo, {
      onSuccess: () => toast.success("Foto atualizada"),
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <FileTrigger acceptedFileTypes={acceptedTypes} onSelect={handleSelect}>
      <Button
        color="secondary"
        size={size}
        iconLeading={UploadCloud02}
        isLoading={uploadPhoto.isPending}
        showTextWhileLoading
        className={className}
      >
        {hasPhoto ? "Trocar foto" : "Enviar foto"}
      </Button>
    </FileTrigger>
  );
}
