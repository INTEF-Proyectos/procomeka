FROM oven/bun:latest AS base
RUN apt-get update && apt-get install -y unzip curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install system tools required at runtime
RUN apt-get update && apt-get install -y --no-install-recommends unzip zip && rm -rf /var/lib/apt/lists/*

# --- Dependencias ---
FROM base AS install

# Copiar todos los package.json del monorepo para resolver workspaces
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/db/package.json packages/db/package.json

RUN bun install --frozen-lockfile

# --- Descargar editor eXeLearning ---
FROM base AS exelearning-editor
RUN RELEASE_URL=$(curl -s "https://api.github.com/repos/exelearning/exelearning/releases/latest" \
      | grep -o '"browser_download_url": *"[^"]*exelearning-static[^"]*\.zip"' \
      | head -1 | cut -d'"' -f4) && \
    if [ -z "$RELEASE_URL" ]; then \
      RELEASE_URL=$(curl -s "https://api.github.com/repos/exelearning/exelearning/releases/latest" \
        | grep -o '"browser_download_url": *"[^"]*\.zip"' \
        | head -1 | cut -d'"' -f4); \
    fi && \
    curl -L -o /tmp/exelearning-static.zip "$RELEASE_URL" && \
    mkdir -p /exelearning-editor && \
    unzip -o -q /tmp/exelearning-static.zip -d /exelearning-editor && \
    rm /tmp/exelearning-static.zip

# --- Build frontend (Astro static) ---
FROM base AS frontend-build

COPY --from=install /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY apps/frontend/ apps/frontend/
COPY packages/db/ packages/db/

ENV NODE_ENV=production
RUN cd apps/frontend && bun run build

# --- API (produccion) ---
FROM base AS api

COPY --from=install /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY apps/api/ apps/api/
COPY apps/cli/ apps/cli/
COPY packages/db/ packages/db/
COPY --from=exelearning-editor /exelearning-editor ./apps/api/static/exelearning-editor

ENV NODE_ENV=production
EXPOSE 3000/tcp

CMD ["bun", "run", "apps/api/src/index.ts"]

# --- Seed (one-shot) ---
FROM base AS seed

COPY --from=install /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
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

# --- All-in-one (API + frontend + seed) ---
FROM base AS app

COPY --from=install /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY apps/api/ apps/api/
COPY apps/cli/ apps/cli/
COPY packages/db/ packages/db/
COPY --from=exelearning-editor /exelearning-editor ./apps/api/static/exelearning-editor
COPY --from=frontend-build /app/apps/frontend/dist ./frontend-dist
COPY docker-entrypoint.sh ./

ENV NODE_ENV=production
ENV SERVE_FRONTEND=./frontend-dist
EXPOSE 3000/tcp

ENTRYPOINT ["./docker-entrypoint.sh"]
