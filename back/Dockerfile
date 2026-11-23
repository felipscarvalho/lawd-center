# syntax=docker/dockerfile:1

# API AdonisJS em produção, em três estágios: dependências, build e imagem final só com o necessário.
# Variáveis de ambiente (APP_KEY, DB_*, ...) entram na execução, nunca na imagem (ver .env.example).
# Com `docker run --env-file`, os valores não são interpolados: APP_URL precisa vir completo, sem ${HOST}.

ARG NODE_VERSION=24

# Dependências completas, usadas para compilar
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Compila o TypeScript para build/ (node ace build também copia package.json e package-lock.json)
FROM deps AS build
COPY . .
RUN node ace build

# Imagem final: código compilado e só as dependências de produção
FROM node:${NODE_VERSION}-bookworm-slim AS production
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    TZ=UTC
WORKDIR /app

COPY --from=build /app/build ./
RUN npm ci --omit=dev && npm cache clean --force

# Arquivos enviados pelos usuários (Drive, disco local): montar um volume aqui para não perdê-los
RUN mkdir -p storage && chown -R node:node /app
VOLUME ["/app/storage"]

USER node
EXPOSE 3333

# A cada deploy, antes de subir o servidor: roda as migrations e os seeders ainda não executados neste
# banco (db:seed:pending, com registro em adonis_seeders; os de demonstração só valem em desenvolvimento).
# Se algum falhar, o container não sobe. Feito para uma única réplica da API.
CMD ["sh", "-c", "node ace migration:run --force && node ace db:seed:pending && exec node bin/server.js"]
