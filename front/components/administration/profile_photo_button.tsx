"use client";

import { useState } from "react";
import { FileTrigger } from "react-aria-components";
import { UploadCloud02 } from "@untitledui/icons";
import { Button, type ButtonProps } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { ImageCropModal } from "@/components/overlays/image_crop_modal";
import { useUploadProfilePhoto } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";

// Mesma regra do validator do backend, que depois comprime a foto para WebP 512×512.
// O recorte sai do navegador em no máximo 1024×1024, bem abaixo do limite
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

// Onde a foto aparece: o quadro grande do perfil e os avatares redondos das listas
const cropPreviews = [
  { label: "Perfil", className: "size-20 rounded-xl" },
  { label: "Avatar", className: "size-10 rounded-full" },
];

/** Botão que abre o seletor de arquivo, confere a imagem, abre o recorte e envia a foto do perfil */
export function ProfilePhotoButton({ userId, hasPhoto, size, className }: ProfilePhotoButtonProps) {
  const uploadPhoto = useUploadProfilePhoto(userId);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const handleSelect = (files: FileList | null) => {
    const photo = files?.[0];

    if (!photo) return;

    const photoError = getPhotoError(photo);

    if (photoError) {
      toast.error("Não foi possível usar esta imagem", { description: photoError });
      return;
    }

    setSelectedPhoto(photo);
    setIsCropOpen(true);
  };

  const upload = (croppedPhoto: File) => {
    uploadPhoto.mutate(croppedPhoto, {
      onSuccess: () => {
        toast.success("Foto atualizada");
        setIsCropOpen(false);
      },
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <>
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

      <ImageCropModal
        isOpen={isCropOpen}
        onOpenChange={setIsCropOpen}
        file={selectedPhoto}
        title="Ajustar foto"
        description="Arraste para posicionar e use o zoom para enquadrar o rosto."
        previews={cropPreviews}
        confirmLabel="Salvar foto"
        isConfirming={uploadPhoto.isPending}
        onConfirm={upload}
      />
    </>
  );
}
