"use client";

import type { FC, ReactNode } from "react";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Alert } from "@/components/feedback/alert";

interface ListContentProps {
  isPending: boolean;
  error?: Error | null;
  /** Lista carregada, mas sem itens (já com os filtros aplicados) */
  isEmpty: boolean;
  loadingLabel: string;
  errorTitle: string;
  empty: {
    icon: FC<{ className?: string }>;
    title: string;
    description: string;
  };
  /** A lista em si (normalmente uma tabela) */
  children: ReactNode;
}

/** Estados de uma lista: carregando, erro, vazia ou o conteúdo */
export function ListContent({
  isPending,
  error,
  isEmpty,
  loadingLabel,
  errorTitle,
  empty,
  children,
}: ListContentProps) {
  if (error) {
    return <Alert color="error" title={errorTitle} description={error.message} />;
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator type="line-spinner" size="md" label={loadingLabel} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      // O EmptyState limita a própria largura: o card fica num wrapper com a largura toda
      <div className="glass rounded-2xl py-12 ring-1 ring-secondary">
        <EmptyState size="md">
          <EmptyState.Header pattern="none">
            <EmptyState.FeaturedIcon icon={empty.icon} color="brand" theme="light" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>{empty.title}</EmptyState.Title>
            <EmptyState.Description>{empty.description}</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      </div>
    );
  }

  return children;
}
