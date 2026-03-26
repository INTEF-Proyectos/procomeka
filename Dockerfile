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

RUN bun install --frozen-lockfile --production

# --- Produccion ---
FROM base AS release

# Bun hoistea todo en el node_modules raiz
COPY --from=install /app/node_modules ./node_modules

COPY package.json ./
COPY apps/api/ apps/api/
COPY apps/cli/ apps/cli/
COPY packages/db/ packages/db/

ENV NODE_ENV=production

EXPOSE 3000/tcp

CMD ["bun", "run", "apps/api/src/index.ts"]
