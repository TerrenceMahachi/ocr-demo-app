import { Router } from "express";
import { z } from "zod";

export default function makeRequestsRouter(db) {
  const router = Router();

  const CreateSchema = z.object({
    name: z.string().min(1),
    dob: z.string().optional().nullable(),
    file: z.string().optional().nullable(),
    text: z.string().optional().nullable(),
    ai_text: z.string().optional().nullable() 

  });

  router.get("/", (req, res) => {
    const rows = db.prepare(
      "SELECT iD, name, dob, file, text, ai_text, created_at FROM requests ORDER BY iD DESC LIMIT 20"
    ).all();
    res.json(rows);
  });

  router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const row = db.prepare(
      "SELECT iD, name, dob, file, text, ai_text, created_at FROM requests WHERE iD = ?"
    ).get(id);
    if (!row) return res.status(404).json({ error: "Record not found" });
    res.json(row);
  });
  router.delete("/", (req, res) => {
    db.prepare("DELETE FROM requests").run();
    res.json({ ok: true });
  });
  router.post("/", (req, res) => {
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    console.log('pd: ' + JSON.stringify(parsed.data))

    const { name, dob = null, file = null, text = null, ai_text } = parsed.data;
    console.log('ai_text: ' + ai_text)
    const info = db.prepare(
      "INSERT INTO requests (name, dob, file, text, ai_text) VALUES (?, ?, ?, ?, ?)"
    ).run(name, dob, file, text, ai_text);
    const row = db.prepare(
      "SELECT iD, name, dob, file, text, ai_text, created_at FROM requests WHERE iD = ?"
    ).get(info.lastInsertRowid);
    res.status(201).json(row);
  });

  router.post("/:id/ai-text", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const { ai_text } = req.body || {};
    db.prepare("UPDATE requests SET ai_text = ? WHERE iD = ?").run(ai_text ?? null, id);
    const row = db.prepare(
      "SELECT iD, name, dob, file, text, ai_text, created_at FROM requests WHERE iD = ?"
    ).get(id);
    res.json(row);
  });

  return router;
}
