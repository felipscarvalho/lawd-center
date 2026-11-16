"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";

interface FormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  /** Normalmente o handleSubmit do react-hook-form */
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Largura do modal: md para formulários curtos, lg para formulários longos */
  size?: "md" | "lg";
  children: ReactNode;
}

/** Modal com formulário: título, campos e botões de cancelar/confirmar */
export const FormModal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel = "Salvar",
  isSubmitting = false,
  size = "md",
  children,
}: FormModalProps) => (
  <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!isSubmitting}>
    <Modal className={size === "lg" ? "max-w-2xl" : "max-w-lg"}>
      <Dialog aria-label={title}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6" noValidate>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            {description && <p className="text-sm text-tertiary">{description}</p>}
          </div>

          <div className="flex flex-col gap-4">{children}</div>

          <div className="flex gap-3">
            <Button color="secondary" className="flex-1" onClick={() => onOpenChange(false)} isDisabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" color="primary" className="flex-1" isLoading={isSubmitting} showTextWhileLoading>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Dialog>
    </Modal>
  </ModalOverlay>
);
