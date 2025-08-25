# build image
FROM node:20-bookworm as builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci
# copy the rest needed for web build
COPY apps/web ./apps/web
# Build Next in production mode
WORKDIR /app/apps/web
ENV NODE_ENV=production
RUN npm run build

# runtime image
FROM node:20-bookworm as runner
WORKDIR /app/apps/web
ENV NODE_ENV=production
# only install prod deps for web
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# bring compiled .next and public
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/next.config.js ./next.config.js
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/public ./public
# ensure uploads folder exists (will be mounted as volume)
RUN mkdir -p ./public/uploads
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
