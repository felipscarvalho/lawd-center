"use client";

import { AlertTriangle } from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  isConfirming?: boolean;
  /** Ações destrutivas usam botão vermelho */
  destructive?: boolean;
}

/** Confirmação de ações que mudam dados de forma relevante (desativar, encerrar vínculo...) */
export const ConfirmModal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isConfirming = false,
  destructive = true,
}: ConfirmModalProps) => (
  <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!isConfirming}>
    <Modal className="max-w-md">
      <Dialog aria-label={title}>
        <div className="flex flex-col gap-5 p-6">
          <FeaturedIcon icon={AlertTriangle} color={destructive ? "error" : "warning"} theme="light" size="lg" />

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            <p className="text-sm text-tertiary">{description}</p>
          </div>

          <div className="flex gap-3">
            <Button color="secondary" className="flex-1" onClick={() => onOpenChange(false)} isDisabled={isConfirming}>
              Cancelar
            </Button>
            <Button
              color={destructive ? "primary-destructive" : "primary"}
              className="flex-1"
              onClick={onConfirm}
              isLoading={isConfirming}
              showTextWhileLoading
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </Dialog>
    </Modal>
  </ModalOverlay>
);
