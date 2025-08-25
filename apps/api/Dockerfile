# --- base with OCR deps ---
FROM node:20-bookworm as base
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr poppler-utils \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- prod deps only (no dev) ---
FROM base as deps
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm ci --omit=dev

# --- runtime image ---
FROM base as runner
ENV NODE_ENV=production
WORKDIR /app
# copy node_modules for workspace packages used by API
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
# copy source
COPY apps/api ./apps/api
# data dir for sqlite
RUN mkdir -p apps/api/data
EXPOSE 4000
CMD ["node", "apps/api/src/index.js"]
