# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (dev deps needed for Vite build)
COPY package*.json ./
RUN npm ci

# Copy source and build the Vite client bundle
COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy the Vite build output from the build stage
COPY --from=builder /app/dist ./dist

EXPOSE 5001

CMD ["node", "server/index.js"]
