# policy-search-frontend — standalone Next.js app
#
# The package.json depends on "@policy-search/contracts" via
# link:../policy-search-backend/packages/contracts. To keep the link resolving
# without touching the lockfile, the contracts source (delivered as the named
# context "contracts", wired in the backend's docker-compose.yml) is placed at
# the exact sibling path /policy-search-backend/packages/contracts.

FROM node:22-slim AS builder

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY --from=contracts package.json /policy-search-backend/packages/contracts/package.json
RUN pnpm install --frozen-lockfile
COPY . .
COPY --from=contracts . /policy-search-backend/packages/contracts/
RUN pnpm build

FROM node:22-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=contracts package.json /policy-search-backend/packages/contracts/package.json
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next .next
COPY next.config.js next-env.d.ts ./
EXPOSE 3000
CMD ["pnpm", "exec", "next", "start"]
