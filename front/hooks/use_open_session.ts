import { useState } from "react";

/**
 * Conta as aberturas de um modal. Usado como `key` do formulário: a cada abertura ele monta de novo,
 * com os valores iniciais, sem restos de um preenchimento anterior. Ao fechar a contagem não muda,
 * então o formulário continua igual durante a animação de saída.
 */
export function useOpenSession(isOpen: boolean) {
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Ajuste de estado durante a renderização quando a prop muda (padrão recomendado pelo React)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setSession((value) => value + 1);
  }

  return session;
}
