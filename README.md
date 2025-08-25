# OCR App (Starter)

Monorepo with **Express API** (services, DB, OCR) and **Next.js** web (views + proxy).

```
ocr-app/
├─ apps/
│  ├─ api/    # Express services (DB + OCR proxy)
│  └─ web/    # Next.js app (SSR pages + API proxy)
└─ shared/    # shared schemas
```

## Quickstart

```bash
# From the extracted root:
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

npm i
npm run migrate -w apps/api     # create SQLite DB/schema
npm run dev                     # API :4000, Web :3000
```
