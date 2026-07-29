FROM node:24-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile --filter api...

COPY apps/api ./apps/api

RUN pnpm --filter api exec prisma generate --config prisma.config.ts
RUN pnpm --filter api build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["pnpm", "--filter", "api", "start:prod"]
