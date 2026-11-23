# Aviso do processo seletivo

Módulo `recruitment`: processo seletivo. Por enquanto guarda só os e-mails de quem pediu, na [página inicial](../../front/landing.md), para ser avisado quando o processo seletivo abrir. Não depende de nenhum outro módulo.

## Tabela

**`selection_subscribers`**

| Coluna | Observação |
|---|---|
| `email` | obrigatório, **único** e sempre em minúsculas (o service normaliza) |
| `created_at` | quando a pessoa se inscreveu |

Só o e-mail: é o mínimo para avisar. Nome, curso e o resto ficam para a inscrição de verdade, quando o processo abrir.

## Rota

`POST /api/v1/recruitment/selection-subscribers` com `{ "email": "..." }`. **Pública**, sem autenticação: quem preenche ainda não é da liga.

- Responde `201` com `{ data: { email } }`
- **Repetir a inscrição não é erro**: o service devolve a inscrição que já existe (`firstOrCreate`), com a mesma resposta. Assim a pessoa não vê um erro por ter esquecido que já se inscreveu, e a rota não revela se um e-mail está na lista
- E-mail inválido: `422` com o erro no campo `email` (VineJS)
- Passou do limite de requisições: `429` com a mensagem no mesmo formato de erro da API (no front vira toast)

## Limite de requisições

A rota é pública e grava no banco, então tem um teto contra envio em massa: **30 inscrições por IP a cada 10 minutos** (`throttleSelectionSubscription`, em `start/limiter.ts`, com o `@adonisjs/limiter`).

- **Teto folgado de propósito**: muita gente pode se inscrever do mesmo IP (a rede da universidade, um evento de divulgação). O objetivo é barrar script, não visitante
- **Contadores na memória** (`config/limiter.ts`): a API roda numa instância só, então não precisa de Redis nem de tabela. Reiniciar o serviço zera os contadores; com mais de uma instância, trocar por um store compartilhado
- **IP de quem acessa, não do proxy**: em produção a API fica atrás do proxy do Easypanel. O `trustProxy: 'uniquelocal'` de `config/app.ts` faz o `request.ip()` ler o `X-Forwarded-For` quando a conexão vem de rede privada (o proxy, no Docker). Sem isso todos os visitantes contariam como um IP só e o limite barraria gente de verdade. Vale para qualquer uso de `request.ip()`, não só aqui

## O que ficou para depois

- **Tela para ver e exportar os e-mails** e o **envio do aviso**: hoje a lista só é lida direto no banco
- **Sair da lista**
