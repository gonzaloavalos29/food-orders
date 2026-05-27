FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY domain/package.json ./domain/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm install --workspaces --include-workspace-root

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.base.json ./
COPY domain ./domain
COPY apps/frontend ./apps/frontend
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
RUN cd apps/frontend && npx vite build

FROM nginx:alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
