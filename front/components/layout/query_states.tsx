import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Alert } from "@/components/feedback/alert";

/** Carregando dados de uma tela ou seção: spinner centralizado */
export function LoadingState({ label, size = "md" }: { label?: string; size?: "sm" | "md" }) {
  return (
    <div className={size === "md" ? "flex justify-center py-16" : "flex justify-center py-8"}>
      <LoadingIndicator type="line-spinner" size={size} label={label} />
    </div>
  );
}

/** Falha ao carregar dados: alerta com a mensagem normalizada da API */
export function ErrorState({ title, error }: { title: string; error: Error }) {
  return <Alert color="error" title={title} description={error.message} />;
}
