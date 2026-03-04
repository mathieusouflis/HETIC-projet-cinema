# apps/api/Dockerfile

FROM node:lts-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm turbo run build --filter @apps/api

RUN pnpm deploy --filter @apps/api --prod --legacy /deploy

FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /deploy .
RUN chown -R app:app /app

USER app

EXPOSE 3000

CMD ["sh", "-c", "node dist/index.js"]
