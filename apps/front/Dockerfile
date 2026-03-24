
FROM node:lts-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

ARG VITE_PUBLIC_POSTHOG_KEY
ARG VITE_PUBLIC_POSTHOG_HOST
ARG BACKEND_API_URL

ENV VITE_PUBLIC_POSTHOG_KEY=$VITE_PUBLIC_POSTHOG_KEY
ENV VITE_PUBLIC_POSTHOG_HOST=$VITE_PUBLIC_POSTHOG_HOST
ENV BACKEND_API_URL=$BACKEND_API_URL

RUN pnpm turbo run build --filter @apps/front

FROM nginx:alpine AS runner

# envsubst is used to replace ${PORT} in nginx.conf at container start
RUN apk add --no-cache gettext

COPY apps/front/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/apps/front/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
