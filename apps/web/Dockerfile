# =====================================================================
# Web (Next.js) Dockerfile — multi-stage, monorepo-aware, standalone build
# Build context MUST be the monorepo root (see docker-compose.yml).
# =====================================================================

# ---------- 1. Builder ----------
FROM node:20-bookworm-slim AS builder

RUN corepack enable
WORKDIR /repo

# NEXT_PUBLIC_* vars are baked into the client bundle at build time
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the entire monorepo (relies on .dockerignore)
COPY . .

# Install workspace deps and build the web app
RUN pnpm install --frozen-lockfile --ignore-scripts \
    && pnpm --filter web exec next build

# ---------- 2. Runner ----------
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# Standalone build copies only what's needed (no node_modules duplication).
# Files inside .next/standalone are rooted at the monorepo root because of
# outputFileTracingRoot in next.config.js.
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public

EXPOSE 3002

# Standalone entry point: apps/web/server.js (relative to monorepo root)
CMD ["node", "apps/web/server.js"]
