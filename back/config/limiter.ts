import { defineConfig, stores } from '@adonisjs/limiter'

/**
 * Limite de requisições (rate limit). Os contadores ficam na memória do processo: a API roda
 * numa instância só, então não precisa de Redis nem de tabela. Reiniciar o serviço zera os
 * contadores; com mais de uma instância, trocar por um store compartilhado (database ou redis).
 */
const limiterConfig = defineConfig({
  default: 'memory',
  stores: {
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
