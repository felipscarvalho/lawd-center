"use client";

import type { CSSProperties } from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Alert, type AlertColor } from "@/components/feedback/alert";

export interface ToastOptions {
  description?: string;
  // Tempo em ms até o toast sumir (padrão do sonner: 4000)
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Renderiza o toast com o mesmo visual do Alert
const show = (color: AlertColor, title: string, options: ToastOptions = {}) =>
  sonnerToast.custom(
    (id) => (
      <Alert
        color={color}
        title={title}
        description={options.description}
        onClose={() => sonnerToast.dismiss(id)}
        // Toast fica opaco para ser legível sobre o conteúdo
        className="w-(--width) glass-strong"
        actions={
          options.action && (
            <Button
              color="link-color"
              size="sm"
              onClick={() => {
                options.action?.onClick();
                sonnerToast.dismiss(id);
              }}
            >
              {options.action.label}
            </Button>
          )
        }
      />
    ),
    { duration: options.duration },
  );

export const toast = {
  info: (title: string, options?: ToastOptions) => show("brand", title, options),
  success: (title: string, options?: ToastOptions) => show("success", title, options),
  warning: (title: string, options?: ToastOptions) => show("warning", title, options),
  error: (title: string, options?: ToastOptions) => show("error", title, options),
  dismiss: sonnerToast.dismiss,
};

// Container dos toasts; deve ser renderizado uma única vez no layout raiz.
// --width define a largura fixa dos toasts e fontFamily herda a fonte do tema (o sonner define a própria)
export const Toaster = () => (
  <SonnerToaster position="top-right" gap={12} style={{ "--width": "400px", fontFamily: "inherit" } as CSSProperties} />
);
