import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

export const FullPageLoading = () => (
  <div className="flex min-h-dvh items-center justify-center">
    <LoadingIndicator type="line-spinner" size="md" label="Carregando..." />
  </div>
);
