import { Card } from "@/components/layout/card";

/** Número em destaque com o rótulo (indicadores da análise) */
export function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card className="flex min-w-0 flex-col gap-2 p-4 sm:p-5">
      <span className="text-sm text-tertiary">{label}</span>
      <span className="text-display-sm font-semibold text-primary">{value}</span>
      {hint && <span className="text-xs text-quaternary">{hint}</span>}
    </Card>
  );
}
