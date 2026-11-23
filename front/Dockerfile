# syntax=docker/dockerfile:1

# Front Next.js em produção, com a saída standalone do Next (servidor próprio, sem node_modules inteiro).

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
# Variáveis NEXT_PUBLIC_* são embutidas no código no build: a URL da API é definida aqui, não na execução
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.exemplo.com/api/v1 -t lawd-front front
ARG NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-bookworm-slim AS production
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app

# O standalone não inclui public/ nem os arquivos estáticos do build: copiados à parte
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

CMD ["node", "server.js"]
