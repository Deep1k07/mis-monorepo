# =====================================================================
# Backend (NestJS) Dockerfile — multi-stage, monorepo-aware
# Build context MUST be the monorepo root (see docker-compose.yml).
# =====================================================================

# ---------- 1. Builder ----------
FROM node:20-bookworm-slim AS builder

RUN corepack enable
WORKDIR /repo

# Copy the entire monorepo (relies on .dockerignore to skip node_modules etc.)
COPY . .

# Install all workspace deps and build the backend
RUN pnpm install --frozen-lockfile --ignore-scripts \
    && pnpm --filter backend exec nest build

# ---------- 2. Runner ----------
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Chromium + minimal fonts so Puppeteer can render certificate PDFs
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-dejavu-core \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable
WORKDIR /repo

# Copy the full builder output (workspace deps include symlinks, easier
# to copy whole-monorepo than to try to dedupe per app).
COPY --from=builder /repo .

WORKDIR /repo/apps/backend

EXPOSE 3003

CMD ["node", "dist/main.js"]
