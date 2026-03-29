# --- Base stage ---
FROM oven/bun:latest AS base
WORKDIR /app

# --- Dependencies stage ---
FROM base AS install
COPY package.json bun.lock ./
COPY apps/cli/package.json apps/cli/package.json
COPY packages/db/package.json packages/db/package.json

RUN bun install --frozen-lockfile --production

# --- Release stage ---
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY apps/cli/ apps/cli/
COPY packages/db/ packages/db/

# CLI can be run as-needed
ENTRYPOINT ["bun", "run", "apps/cli/src/index.ts"]
CMD ["--help"]
