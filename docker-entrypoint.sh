#!/bin/sh
set -e

echo "==> Running seed..."
bun run apps/cli/src/index.ts seed || echo "Seed failed or already applied, continuing..."

echo "==> Starting API server..."
exec bun run apps/api/src/index.ts
