/**
 * Catálogo de permissões do módulo projects.
 * Chave no formato `<módulo>.<recurso>.<ação>` e descrição legível (usada em telas e na documentação).
 */
export const projectsPermissions = {
  'projects.project.view': 'Visualizar projetos, equipes e interessados',
  'projects.project.manage': 'Cadastrar e editar projetos',
  'projects.team.manage': 'Gerenciar a equipe dos projetos',
} as const
