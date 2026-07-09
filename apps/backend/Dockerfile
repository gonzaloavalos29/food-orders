FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable
WORKDIR /app
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn/releases ./.yarn/releases
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/
RUN yarn install

FROM node:20-alpine AS build
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json package.json ./
COPY domain ./domain
COPY apps/backend ./apps/backend
RUN npx tsc -p domain/tsconfig.json
RUN cd apps/backend && npx prisma generate --schema=./prisma/schema.prisma
RUN npx tsc -p apps/backend/tsconfig.json
RUN cd apps/backend && npx tsc --target ES2022 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule prisma/seed.ts

FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/domain/dist ./domain/dist
COPY --from=build /app/domain/package.json ./domain/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/package.json ./package.json
EXPOSE 3001
WORKDIR /app/apps/backend
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && (node prisma/seed.js || true) && node dist/index.js"]
