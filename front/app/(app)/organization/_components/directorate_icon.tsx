import { Building07, Star01 } from "@untitledui/icons";
import type { DirectorateKind } from "@/types/administration";
import { cx } from "@/utils/cx";

/** Ícone da diretoria no grafo e na lista: estrela para o núcleo institucional, prédio para as demais */
export function DirectorateIcon({ kind, className }: { kind: DirectorateKind; className?: string }) {
  const Icon = kind === "core" ? Star01 : Building07;

  return (
    <span className={cx("flex shrink-0 items-center justify-center bg-brand-solid/15", className)}>
      <Icon className="size-5 text-fg-brand-secondary" />
    </span>
  );
}
