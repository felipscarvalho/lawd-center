"use client";

import type { FC, ReactNode } from "react";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { Card } from "@/components/layout/card";

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
    return <ErrorState title={errorTitle} error={error} />;
  }

  if (isPending) {
    return <LoadingState label={loadingLabel} />;
  }

  if (isEmpty) {
    return (
      // O EmptyState limita a própria largura: o card fica num wrapper com a largura toda
      <Card className="py-12">
        <EmptyState size="md">
          <EmptyState.Header pattern="none">
            <EmptyState.FeaturedIcon icon={empty.icon} color="brand" theme="light" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>{empty.title}</EmptyState.Title>
            <EmptyState.Description>{empty.description}</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      </Card>
    );
  }

  return children;
}
