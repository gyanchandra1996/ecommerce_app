# Dockerfile for Next.js E-Commerce Modular Platform

# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NEXT_TELEMETRY_DISABLED=1

# 2. Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for PostgreSQL
RUN npx prisma generate

# Build Next.js application
ENV NODE_ENV=production
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create uploads and data folders and assign ownership to nextjs
RUN mkdir -p /app/public/uploads /app/data \
    && chown -R nextjs:nodejs /app/public/uploads /app/data

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/data ./data
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next

# Ensure nextjs owns the runtime folders
RUN chown -R nextjs:nodejs /app/public/uploads /app/data

USER nextjs

EXPOSE 3000

# Push PostgreSQL schema on startup if DB is ready, seed initial data, then launch Next.js
CMD ["sh", "-c", "(npx prisma db push --skip-generate || true) && (node scripts/seed.mjs || true) && npm run start"]
