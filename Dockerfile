FROM oven/bun:latest AS base
WORKDIR /app

# --- Dependencias ---
FROM base AS install

# Copiar todos los package.json del monorepo para resolver workspaces
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/db/package.json packages/db/package.json

RUN bun install --frozen-lockfile

# --- Build frontend (Astro static) ---
FROM base AS frontend-build

COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY apps/frontend/ apps/frontend/
COPY packages/db/ packages/db/

ENV NODE_ENV=production
RUN cd apps/frontend && bun run build

# --- API (produccion) ---
FROM base AS api

COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY apps/api/ apps/api/
COPY apps/cli/ apps/cli/
COPY packages/db/ packages/db/

ENV NODE_ENV=production
EXPOSE 3000/tcp

CMD ["bun", "run", "apps/api/src/index.ts"]

# --- Seed (one-shot) ---
FROM base AS seed

COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY apps/api/ apps/api/
COPY apps/cli/ apps/cli/
COPY packages/db/ packages/db/

ENV NODE_ENV=production

CMD ["bun", "run", "apps/cli/src/index.ts", "seed"]

# --- Frontend (nginx) ---
FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/apps/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80/tcp
