import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { openDB } from "./db/index.js";
import makeRequestsRouter from "./routes/requests.js";

const PORT = Number(process.env.PORT || 4000);
const DB_PATH = process.env.DB_PATH || "./data/ocr.db";
const OCR_HANDLER_URL = process.env.OCR_HANDLER_URL;
const OCR_TOKEN = process.env.OCR_TOKEN;

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(cors({ origin: [/localhost:\d+$/] }));

const db = openDB(DB_PATH);
app.use("/requests", makeRequestsRouter(db));

app.post("/ocr", async (req, res) => {
  try {
    if (!OCR_HANDLER_URL || !OCR_TOKEN) {
      return res.status(500).json({ error: "OCR not configured" });
    }
    const upstream = await fetch(OCR_HANDLER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OCR-Token": OCR_TOKEN
      },
      body: JSON.stringify({ image: req.body?.image })
    });
    const text = await upstream.text();
    res.status(upstream.status).type("application/json").send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(` API started on http://localhost:${PORT}`);
});
