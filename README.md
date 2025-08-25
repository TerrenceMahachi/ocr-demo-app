# OCR Demo APP

Monorepo OCR demo with **Next.js** (frontend) + **Express** (API), **SQLite** storage, and OCR via **Tesseract** (images) and **pdftotext** (PDF). Includes **Tailwind CSS**, file uploads (served from `/public/uploads`), optional AI OCR proxy, and a **Docker Compose** deployment.

```
ocr-demo-app/
├─ apps/
│  ├─ api/        # Express API (DB + OCR proxy endpoint)
│  └─ web/        # Next.js app (pages + API proxy for upload)
└─ shared/        # (optional) shared schemas/utilities
```

## Features

- Capture **Name**, **DOB**, optional **file (PDF/image)**, optional **AI OCR**
- Native OCR:
  - **PDF** → `pdftotext` (poppler-utils)
  - **Images** → `tesseract-ocr`
- Files saved to **`apps/web/public/uploads`**; DB row stores a **public URL path** (not base64)
- Result page shows extracted text, AI text, and file card preview
- Records table with “Clear all” action
- Tailwind v3 styling

---

## Prerequisites

**Local (non-Docker)**
- Node.js 18+ (LTS recommended)
- `tesseract-ocr` and `pdftotext` available on PATH  
  - macOS: `brew install tesseract poppler`
  - Ubuntu: `sudo apt-get install -y tesseract-ocr poppler-utils`

**Docker**
- Docker Engine + Docker Compose plugin

---

## Environment Variables

### apps/api/.env
```
PORT=4000
DB_PATH=./data/ocr.db
OCR_HANDLER_URL=              # optional: upstream OCR proxy for /ocr
OCR_TOKEN=                    # optional: token for OCR proxy
```

### apps/web/.env.local
```
API_BASE=http://localhost:4000

# Optional AI OCR (used by /api/upload route when 'Use AI' is ticked)
GOOGLE_VISION_PROXY_URL=
GOOGLE_VISION_PROXY_TOKEN=
```

> Do **not** commit `.env` files.

---

## Install & Run (Local, non-Docker)

From repo root:

```bash
# install deps
npm i

# create DB tables
npm run migrate -w apps/api

# ensure uploads dir exists
mkdir -p apps/web/public/uploads

# dev servers
npm run dev -w apps/api    # http://localhost:4000
npm run dev -w apps/web    # http://localhost:3000
```

Open http://localhost:3000

---

## Endpoints & Pages

- **Web (Next.js)**
  - `/` — Capture form (drag/drop, AI toggle)
  - `/result/:id` — Saved record view
  - `/records` — Table of all records (with “Clear” button)
  - API routes (proxy):
    - `POST /api/upload` — handles form upload, runs OCR, stores file, calls API
    - `DELETE /api/records/clear` — clears all records via API

- **API (Express)**
  - `GET /requests` — list all
  - `GET /requests/:id` — get one
  - `POST /requests` — create `{ name, dob, file, text, ai_text }`
  - `POST /requests/:id/ai-text` — update `ai_text`
  - `DELETE /requests` — delete all
  - `POST /ocr` — optional upstream proxy (if `OCR_HANDLER_URL/TOKEN` set)

---

## Build for Production (non-Docker)

```bash
# API: run directly (no build step)
npm run start -w apps/api      # or use PM2 (see below)

# Web: build and start
npm run build -w apps/web
npm run start -w apps/web      # serves on :3000
```

Optional **PM2** setup (Ubuntu):
```bash
sudo npm i -g pm2
pm2 start apps/api/src/index.js --name ocr-api
pm2 start "npm -- start -w apps/web" --name ocr-web
pm2 save && pm2 startup
```

Reverse-proxy with Nginx to expose on 80/443.

---

## Docker Deployment

### Files included
- `apps/api/Dockerfile` (API with OCR binaries)
- `apps/web/Dockerfile` (Next.js builder + runtime)
- `docker-compose.yml` (orchestrates both)

### .env for Compose (optional, next to `docker-compose.yml`)
```
OCR_HANDLER_URL=
OCR_TOKEN=
GOOGLE_VISION_PROXY_URL=
GOOGLE_VISION_PROXY_TOKEN=
```

### Build & Run

```bash
docker compose up -d --build

# first time only: run migration inside the API container
docker compose exec api node apps/api/src/db/migrate.js
```

**Services**
- Web: http://localhost:3000
- API: http://localhost:4000

**Volumes**
- DB → named volume `db-data` → persists `apps/api/data/ocr.db`
- Uploads → named volume `uploads` → persists `apps/web/public/uploads`

> In production, front with Nginx and point it at port 3000.

---

## GitHub → VPS Deploy (quick flow)

On your VPS:

```bash
# first time
git clone https://github.com/TerrenceMahachi/ocr-demo-app.git
cd ocr-demo-app
docker compose up -d --build
docker compose exec api node apps/api/src/db/migrate.js
```

After code updates:
```bash
git pull
docker compose up -d --build
```

---

## Tailwind CSS

- Tailwind v3 configured in `apps/web`:
  - `tailwind.config.js` scans `app/**` and `components/**`
  - `app/layout.js` imports `app/globals.css`
- Adjust styles via class names; no additional setup needed.

---

## File Storage

- Uploaded files are written to **`apps/web/public/uploads`**
- The DB stores a **public path** like `/uploads/abc123.png`
- PDF preview uses `/pdf-placeholder.png` (place it under `apps/web/public/`)

---

## Troubleshooting

- **Styles not applying** → ensure `import "./globals.css"` in `apps/web/app/layout.js`
- **“Failed to parse URL from /api/requests”** → server components must use absolute URL; we use `process.env.API_BASE`
- **OCR errors**
  - Install `tesseract-ocr` and `poppler-utils`
  - Ensure the binaries are on PATH (non-Docker)
- **AI OCR not set** → form submits fine without it; set `GOOGLE_VISION_PROXY_URL/TOKEN` to enable
- **Large uploads blocked** → increase body size in Nginx (`client_max_body_size 20M;`)

---

## License

MIT (optional—add a LICENSE file if you want).

---

## Credits

Built with love 💙 using Next.js, Express, Tailwind, Tesseract, and Poppler.
