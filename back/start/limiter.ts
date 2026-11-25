/*
|--------------------------------------------------------------------------
| Limites de requisições (rate limit)
|--------------------------------------------------------------------------
|
| Cada limite criado com "limiter.define" é um middleware, aplicado nas rotas
| do módulo que precisa dele. A chave padrão é o IP de quem faz a requisição.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/** Inscrições no aviso do processo seletivo aceitas por IP a cada janela de 10 minutos */
export const SELECTION_SUBSCRIPTIONS_PER_WINDOW = 30

/**
 * Inscrição no aviso do processo seletivo: rota pública, então precisa de um teto contra envio em
 * massa. O teto é folgado porque muita gente pode se inscrever do mesmo IP (a rede da universidade).
 */
export const throttleSelectionSubscription = limiter.define('selectionSubscription', () => {
  return limiter
    .allowRequests(SELECTION_SUBSCRIPTIONS_PER_WINDOW)
    .every('10 minutes')
    .limitExceeded((error) => {
      error.setMessage('Muitas inscrições vindas desta rede. Tente de novo em alguns minutos.')
    })
})

/** Tentativas de aceitar convite por IP a cada janela de 15 minutos */
export const INVITATION_ACCEPTANCES_PER_WINDOW = 10

/**
 * Aceite de convite: rota pública que grava a senha. O token já é longo demais para adivinhar;
 * o limite só corta tentativas em massa.
 */
export const throttleInvitationAcceptance = limiter.define('invitationAcceptance', () => {
  return limiter
    .allowRequests(INVITATION_ACCEPTANCES_PER_WINDOW)
    .every('15 minutes')
    .limitExceeded((error) => {
      error.setMessage('Muitas tentativas vindas desta rede. Tente de novo em alguns minutos.')
    })
})
