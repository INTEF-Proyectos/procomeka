# --- Base stage ---
FROM oven/bun:1.2.14 AS base
WORKDIR /app

# --- Build stage ---
FROM base AS build
COPY package.json bun.lock ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/db/package.json packages/db/package.json

RUN bun install --frozen-lockfile

COPY apps/frontend/ apps/frontend/
COPY packages/db/ packages/db/

# Build static files
# We can pass env vars here if needed for build-time configuration
RUN cd apps/frontend && bun run build

# --- Production stage ---
FROM nginx:1.27.4-alpine AS release

# Copy built files from build stage to Nginx web root
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

# Optional: custom nginx configuration for routing (useful for Astro if using complex routes)
# COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
