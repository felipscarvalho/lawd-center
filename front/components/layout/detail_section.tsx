import type { ReactNode } from "react";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Seção com título (e descrição opcional), separada da anterior por uma linha; usada em formulários e leituras */
export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-secondary pt-6 first:border-t-0 first:pt-0">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-md font-semibold text-primary">{title}</h3>
        {description && <p className="text-sm text-tertiary">{description}</p>}
      </header>
      {children}
    </section>
  );
}

/** Campo só de leitura (rótulo e valor); sem valor mostra "Não informado" */
export function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <dt className="text-sm text-tertiary">{label}</dt>
      <dd className="text-sm text-primary">{children ?? <span className="text-quaternary">Não informado</span>}</dd>
    </div>
  );
}

/** Campo só de leitura com uma lista de etiquetas */
export function DetailTags({ label, items, color }: { label: string; items: string[]; color: "brand" | "gray" }) {
  return (
    <DetailField label={label}>
      {items.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} size="sm" color={color}>
              {item}
            </Badge>
          ))}
        </span>
      ) : null}
    </DetailField>
  );
}
