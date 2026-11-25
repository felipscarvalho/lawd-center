"use client";

import Link from "next/link";
import { Plus } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Card } from "@/components/layout/card";
import { PersonLink, UserAvatar } from "@/components/administration/person_link";
import { directorateKindLabels, displayName } from "@/lib/administration";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import type { Directorate, Membership } from "@/types/administration";
import { cx } from "@/utils/cx";
import { DirectorateIcon } from "./directorate_icon";

/*
 * Linhas da árvore só com CSS (pseudo-elementos), sem biblioteca de grafos: cada diretoria desenha o seu
 * trecho da linha horizontal e a descida até o card; a primeira e a última arredondam os cantos;
 * o -ml-px/-mr-px centraliza a borda de 2px na mesma linha da linha central
 * (first/last-of-type: a linha central da fileira é um <span> e não pode contar como primeiro filho).
 * (Módulos CSS não funcionam aqui: o next.config passa todo .css pelo Tailwind como CSS global.)
 */
const lineColor = "var(--color-border-brand)";

const branchClass = cx(
  "relative flex justify-center px-5 pt-12",
  "before:absolute before:top-4 before:right-1/2 before:-mr-px before:h-8 before:w-1/2 before:border-t-2 before:border-brand before:content-['']",
  "after:absolute after:top-4 after:left-1/2 after:-ml-px after:h-8 after:w-1/2 after:border-t-2 after:border-l-2 after:border-brand after:content-['']",
  "first-of-type:before:border-t-0 first-of-type:after:rounded-tl-[14px]",
  "last-of-type:after:hidden last-of-type:before:border-r-2 last-of-type:before:rounded-tr-[14px]",
);

/** Diretoria única: só a descida, sem linha horizontal */
const singleBranchClass =
  "relative flex justify-center px-5 pt-12 before:absolute before:top-0 before:left-1/2 before:-ml-px before:h-12 before:border-l-2 before:border-brand before:content-['']";

const dotClass = "absolute left-1/2 z-1 size-2.5 -translate-x-1/2 rounded-full ring-[3px] ring-bg-primary";

/** Membros mostrados como avatares no card; o restante aparece como "+N" */
const visibleMembers = 5;

interface OrganizationGraphProps {
  directorates: Directorate[];
  /** Pode atribuir cargos nesta diretoria (mesma regra dos cards) */
  canManage: (directorate: Directorate) => boolean;
  onAddMember: (directorate: Directorate) => void;
}

/**
 * Organograma em árvore, só para visualização: núcleo institucional no topo ligado às diretorias.
 * Encerrar vínculos continua na visualização em lista e no detalhe do usuário.
 */
export function OrganizationGraph({ directorates, canManage, onAddMember }: OrganizationGraphProps) {
  const cores = directorates.filter((directorate) => directorate.kind === "core");
  const standards = directorates.filter((directorate) => directorate.kind === "standard");
  // Quebra as diretorias em linhas que cabem na tela, sem rolagem: número par por linha para a linha
  // central passar no vão entre os cards
  // (no celular, uma por fileira: duas não cabem na largura)
  const isWide = useBreakpoint("2xl");
  const isTablet = useBreakpoint("md");
  const perRow = isWide ? 4 : isTablet ? 2 : 1;
  const rows = Array.from({ length: Math.ceil(standards.length / perRow) }, (_, index) =>
    standards.slice(index * perRow, (index + 1) * perRow),
  );

  const renderNode = (directorate: Directorate, position: "root" | "child") => (
    <GraphNode
      directorate={directorate}
      hasDotTop={position === "child" && cores.length > 0}
      hasDotBottom={position === "root" && standards.length > 0}
      canManage={canManage(directorate)}
      onAddMember={() => onAddMember(directorate)}
    />
  );

  return (
    // Fundo pontilhado, como uma tela de diagrama
    <Card className="bg-[radial-gradient(var(--color-border-secondary)_1px,transparent_1px)] bg-size-[20px_20px] px-2 py-10 sm:px-6">
      <div className="mx-auto flex w-max flex-col items-center">
        {cores.map((core) => (
          <div key={core.id}>{renderNode(core, "root")}</div>
        ))}

        {cores.length > 0 && standards.length > 0 && <div className="h-8 w-0.5" style={{ background: lineColor }} />}

        {rows.map((row, index) => (
          <div key={row[0].id} className="relative flex justify-center">
            {/* Trecho da linha central do topo da fileira até a linha horizontal (16px abaixo, para não encostar nos cards de cima) */}
            {cores.length > 0 && (
              <span className="absolute top-0 left-1/2 h-4 w-0.5 -translate-x-1/2" style={{ background: lineColor }} />
            )}

            {/* Linha central descendo até a próxima linha de diretorias (passa no vão entre os cards; com uma por fileira, a ligação é direta) */}
            {cores.length > 0 && perRow > 1 && index < rows.length - 1 && (
              <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: lineColor }} />
            )}

            {row.map((directorate) => (
              <div
                key={directorate.id}
                className={cores.length === 0 ? "px-5 pt-12" : row.length === 1 ? singleBranchClass : branchClass}
              >
                {renderNode(directorate, "child")}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

interface GraphNodeProps {
  directorate: Directorate;
  hasDotTop: boolean;
  hasDotBottom: boolean;
  canManage: boolean;
  onAddMember: () => void;
}

function GraphNode({ directorate, hasDotTop, hasDotBottom, canManage, onAddMember }: GraphNodeProps) {
  const isCore = directorate.kind === "core";
  const memberships = directorate.memberships ?? [];

  return (
    <article className="relative w-56 rounded-2xl bg-primary ring-1 ring-secondary">
      {hasDotTop && <span className={cx(dotClass, "-top-[5px]")} style={{ background: lineColor }} />}

      <header className="flex items-center gap-3 rounded-t-2xl border-b border-secondary bg-brand-solid/5 px-4 py-3">
        <DirectorateIcon kind={directorate.kind} className="size-10 rounded-xl" />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-brand-tertiary uppercase">
            {directorateKindLabels[directorate.kind]}
          </p>
          <p className="truncate text-md font-semibold text-primary">{directorate.name}</p>
        </div>

        {canManage && (
          <ButtonUtility
            size="xs"
            color="tertiary"
            icon={Plus}
            tooltip="Atribuir cargo"
            aria-label={`Atribuir cargo em ${directorate.name}`}
            onClick={onAddMember}
          />
        )}
      </header>

      <div className="px-4 py-3">
        {memberships.length === 0 ? (
          <p className="text-sm text-quaternary">Nenhum cargo ativo</p>
        ) : isCore ? (
          <ul className="flex flex-col gap-2">
            {memberships.map((membership) => (
              <li key={membership.id}>
                <PersonLink userId={membership.userId} person={membership.user} subtitle={membership.positionLabel} />
              </li>
            ))}
          </ul>
        ) : (
          <StandardMembers memberships={memberships} />
        )}
      </div>

      {hasDotBottom && <span className={cx(dotClass, "-bottom-[5px]")} style={{ background: lineColor }} />}
    </article>
  );
}

/** Diretoria comum: diretor em destaque e os membros como avatares */
function StandardMembers({ memberships }: { memberships: Membership[] }) {
  const director = memberships.find((membership) => membership.position === "director");
  const members = memberships.filter((membership) => membership.position === "member");
  const hiddenCount = members.length - visibleMembers;

  return (
    <div className="flex flex-col gap-3">
      {director ? <PersonLink userId={director.userId} person={director.user} subtitle={director.positionLabel} /> : <p className="text-sm text-quaternary">Sem diretor</p>}

      {members.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-tertiary">
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </p>
          <div className="flex items-center -space-x-2">
            {members.slice(0, visibleMembers).map((membership) => (
              <Link
                key={membership.id}
                href={`/users/${membership.userId}`}
                title={membership.user && displayName(membership.user)}
                aria-label={`Ver perfil de ${membership.user ? displayName(membership.user) : ""}`}
                className="rounded-full outline-focus-ring transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:outline-2"
              >
                <UserAvatar person={membership.user} size="sm" className="ring-2 ring-bg-primary" />
              </Link>
            ))}
            {hiddenCount > 0 && (
              <span className="z-0 flex size-8 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-secondary ring-2 ring-bg-primary">
                +{hiddenCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
