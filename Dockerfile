# Multi-stage production Dockerfile for Google Cloud Run (Node 22 + Vite + Express)
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build && npm prune --omit=dev --legacy-peer-deps

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

EXPOSE 8080

CMD ["npm", "start"]
