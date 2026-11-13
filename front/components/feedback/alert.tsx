"use client";

import type { FC, ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, InfoCircle, XClose } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

export type AlertColor = "brand" | "gray" | "success" | "warning" | "error";

// Ícone padrão de cada cor, usado quando nenhum ícone é informado
const defaultIcons: Record<AlertColor, FC<{ className?: string }>> = {
  brand: InfoCircle,
  gray: InfoCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export interface AlertProps {
  title: string;
  description?: ReactNode;
  color?: AlertColor;
  icon?: FC<{ className?: string }>;
  // Ações exibidas abaixo do texto (ex.: botões link)
  actions?: ReactNode;
  // Quando informado, exibe o botão de fechar
  onClose?: () => void;
  className?: string;
}

export const Alert = ({ title, description, color = "brand", icon, actions, onClose, className }: AlertProps) => {
  const Icon = icon ?? defaultIcons[color];

  return (
    <div
      // Erros e avisos interrompem o leitor de tela; os demais são anunciados sem interromper
      role={color === "error" || color === "warning" ? "alert" : "status"}
      className={cx(
        "relative flex w-full flex-col gap-3 rounded-xl glass p-4 ring-1 ring-secondary sm:flex-row sm:gap-4",
        className,
      )}
    >
      <FeaturedIcon icon={Icon} color={color} theme="outline" size="md" className="shrink-0" />

      <div className={cx("flex flex-1 flex-col gap-3", onClose && "pr-8")}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-secondary">{title}</p>
          {description && <div className="text-sm text-tertiary">{description}</div>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {onClose && (
        <AriaButton
          aria-label="Fechar"
          onPress={onClose}
          className="absolute top-2 right-2 flex size-9 cursor-pointer items-center justify-center rounded-lg text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <XClose className="size-5" />
        </AriaButton>
      )}
    </div>
  );
};
