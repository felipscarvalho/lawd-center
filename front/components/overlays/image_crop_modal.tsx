"use client";

import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { ImageCropPreview, ImageCropper } from "@/components/media/image_cropper";
import { useOpenSession } from "@/hooks/use_open_session";
import { baseFileName, cropImage, type ImageCrop } from "@/lib/image_crop";
import { cx } from "@/utils/cx";

interface CropPreview {
  label: string;
  /** Tamanho e formato da prévia (ex.: `size-10 rounded-full`) */
  className: string;
}

interface ImageCropModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Imagem escolhida pela pessoa, ainda sem recorte */
  file: File | null;
  title?: string;
  description?: string;
  /** Proporção largura/altura do recorte */
  aspect?: number;
  shape?: "rect" | "round";
  /** Maior lado do arquivo gerado */
  maxSize?: number;
  /** Prévias do resultado nos tamanhos em que a imagem aparece (ex.: avatar pequeno) */
  previews?: CropPreview[];
  confirmLabel?: string;
  /** Uso do arquivo em andamento (ex.: envio ao backend) */
  isConfirming?: boolean;
  /** Recebe o recorte já como arquivo */
  onConfirm: (file: File) => void;
}

/** Modal para recortar uma imagem antes de usá-la: moldura, zoom e prévias do resultado */
export function ImageCropModal({ isOpen, onOpenChange, file, isConfirming = false, ...props }: ImageCropModalProps) {
  const session = useOpenSession(isOpen);

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!isConfirming}>
      <Modal className="max-w-lg">
        <Dialog aria-label={props.title ?? "Recortar imagem"}>
          {file && (
            <ImageCropContent
              key={session}
              file={file}
              onCancel={() => onOpenChange(false)}
              isConfirming={isConfirming}
              {...props}
            />
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

interface ImageCropContentProps extends Omit<ImageCropModalProps, "isOpen" | "onOpenChange" | "file"> {
  file: File;
  onCancel: () => void;
}

function ImageCropContent({
  file,
  title = "Recortar imagem",
  description = "Arraste para posicionar e use o zoom para ajustar o enquadramento.",
  aspect = 1,
  shape = "rect",
  maxSize = 1024,
  previews = [],
  confirmLabel = "Aplicar",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ImageCropContentProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<ImageCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Data URL em vez de object URL: não precisa revogar, então sobrevive à montagem dupla do StrictMode
  useEffect(() => {
    const reader = new FileReader();

    reader.onload = () => setSrc(reader.result as string);
    reader.onerror = () => toast.error("Não foi possível ler a imagem");
    reader.readAsDataURL(file);

    return () => reader.abort();
  }, [file]);

  const confirm = async () => {
    if (!src || !crop) return;

    setIsCropping(true);

    try {
      const cropped = await cropImage(src, crop.area, { maxSize, fileName: baseFileName(file.name) });

      onConfirm(cropped);
    } catch {
      toast.error("Não foi possível recortar a imagem");
    } finally {
      setIsCropping(false);
    }
  };

  const isBusy = isCropping || isConfirming;

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="text-sm text-tertiary">{description}</p>
      </div>

      {src ? (
        <ImageCropper src={src} aspect={aspect} shape={shape} onCropChange={setCrop} />
      ) : (
        <div className="w-full animate-pulse rounded-xl bg-quaternary" style={{ aspectRatio: aspect }} />
      )}

      {src && previews.length > 0 && (
        <div className="flex items-end gap-4">
          <span className="self-center text-sm font-medium text-secondary">Prévia</span>

          {previews.map((preview) => (
            <div key={preview.label} className="flex flex-col items-center gap-1.5">
              <ImageCropPreview src={src} crop={crop} className={cx("ring-1 ring-secondary", preview.className)} />
              <span className="text-xs text-tertiary">{preview.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button color="secondary" className="flex-1" onClick={onCancel} isDisabled={isBusy}>
          Cancelar
        </Button>
        <Button
          color="primary"
          className="flex-1"
          onClick={confirm}
          isDisabled={!crop}
          isLoading={isBusy}
          showTextWhileLoading
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
