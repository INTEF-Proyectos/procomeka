# --- Base stage ---
FROM oven/bun:1.2.14 AS base
WORKDIR /app

# --- Dependencies stage ---
FROM base AS install
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json

# Install dependencies including the DB package workspace
RUN bun install --frozen-lockfile --production

# --- Build/Release stage ---
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY apps/api/ apps/api/
COPY packages/db/ packages/db/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "apps/api/src/index.ts"]
