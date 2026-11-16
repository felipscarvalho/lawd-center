/**
 * Catálogo de permissões do módulo administration.
 * Chave no formato `<módulo>.<recurso>.<ação>` e descrição legível (usada em telas e na documentação).
 */
export const administrationPermissions = {
  'administration.user.view': 'Visualizar usuários',
  'administration.user.create': 'Cadastrar usuários',
  'administration.user.update': 'Editar usuários',
  'administration.user.deactivate': 'Desativar usuários',

  'administration.directorate.view': 'Visualizar diretorias',
  'administration.directorate.manage': 'Cadastrar e editar diretorias',

  'administration.membership.view': 'Visualizar vínculos e organograma',
  'administration.membership.manage': 'Atribuir e encerrar cargos',
} as const
