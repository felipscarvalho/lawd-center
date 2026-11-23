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

## O que ficou para depois

- **Limite de requisições**: a rota é pública e não tem proteção contra envio em massa. O `@adonisjs/limiter` resolve, mas é dependência nova e não foi instalado
- **Tela para ver e exportar os e-mails** e o **envio do aviso**: hoje a lista só é lida direto no banco
- **Sair da lista**
