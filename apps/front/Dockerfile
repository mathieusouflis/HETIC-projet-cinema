# apps/web/Dockerfile

FROM node:lts-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm turbo run build --filter @apps/front

FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN npm install -g serve

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/apps/front/dist ./dist
RUN chown -R app:app /app/dist

USER app

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
