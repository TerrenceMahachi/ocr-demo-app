// apps/web/app/api/upload/route.js
export const runtime = "nodejs";

import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import tesseract from "node-tesseract-ocr";

const execFileAsync = promisify(execFile);

const API_BASE = process.env.API_BASE || "http://localhost:4000";

// Where we store files for the web app to serve statically
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function isAllowedMime(type) {
    return !!type && (type === "application/pdf" || type.startsWith("image/"));
}
function safeExtFromName(name = "") {
    const ext = path.extname(name).toLowerCase();
    const ok = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff", ".svg"]);
    if (ok.has(ext)) { return ext } else { return ""; }

}
function isImage(type) {
    if( typeof type === "string" && type.startsWith("image/")){ return true; }else{ return false; }
}

export async function POST(req) {
    try {
        const form = await req.formData();

        const name = (form.get("name") ?? "").toString().trim();
        const dob = (form.get("dob") ?? "").toString().trim();
        const file = form.get("file");
        const useAI = !!form.get("use_ai");

        if (!name) {
            return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
        }
        if ( !dob) {
            return new Response(JSON.stringify({ error: "Date of Birth is required" }), { status: 400 });
        }

        let storedPath = null;     // e.g. /uploads/abc123.png 
        let extractedText = null;  // native OCR or pdftotext
        let aiText = null;         // optional AI OCR

        if (file && typeof file === "object" && "arrayBuffer" in file) {
            const mime = file.type || "";
            const ext = safeExtFromName(file.name || "");
            if (!isAllowedMime(mime) || !ext) {
                return new Response(JSON.stringify({ error: "Please povide a valid PDF or image file" }), { status: 400 });
            }

            const buf = Buffer.from(await file.arrayBuffer());

            // ---- Extract text ----
            try {
                if (mime === "application/pdf") {
                    // Use poppler's pdftotext
                    const tmpPdf = path.join(os.tmpdir(), `upload-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
                    const tmpTxt = tmpPdf.replace(/\.pdf$/i, ".txt");
                    fs.writeFileSync(tmpPdf, buf);
                    try {
                        await execFileAsync("pdftotext", ["-layout", "-enc", "UTF-8", tmpPdf, tmpTxt]);
                        extractedText = fs.existsSync(tmpTxt) ? (fs.readFileSync(tmpTxt, "utf8").trim() || null) : null;
                    } finally {
                        try { fs.unlinkSync(tmpPdf); } catch { }
                        try { fs.unlinkSync(tmpTxt); } catch { }
                    }
                } else if (isImage(mime)) {
                    const text = await tesseract.recognize(buf, { lang: "eng" });
                    extractedText = (text || "").trim() || null;

                    if (useAI) {
                        const url = process.env.GOOGLE_VISION_PROXY_URL;
                        // const token = (process.env.GOOGLE_VISION_PROXY_TOKEN).toString();
                        const token = 'v2Ex1$gL@z7K!9cTfQxWnRp0bLmZfYt8Ih63D^uKvM4NsJwHiOdPgReSaXcVbTgUq';
                        //console.warn('TOKEN: ' + token + '; url: ' + url);

                        if (url && token) {
                            try {
                                const payload = JSON.stringify({ image: buf.toString("base64") });
                                const controller = new AbortController();
                                const timeout = setTimeout(() => controller.abort(), 30_000);

                                const r = await fetch(url, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "X-OCR-Token": token,
                                    },
                                    body: payload,
                                    signal: controller.signal,
                                }).catch((e) => {
                                    if (e.name === "AbortError") throw new Error("AI OCR request timed out");
                                    throw e;
                                });

                                clearTimeout(timeout);
                                if (r.ok) {
                                    const j = await r.json();
                                    aiText = j.text || null;

                                } else {
                                    // non-fatal
                                }
                            } catch {
                                // non-fatal
                            }
                        }
                    }
                }
            } catch {
                // non-fatal; 
            }

            // ---- Persist file to public/uploads and store a path ----
            const base = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
            const filename = `${base}${ext}`;
            fs.writeFileSync(path.join(uploadsDir, filename), buf);
            storedPath = `/uploads/${filename}`; // this is what goes into DB
        }

        // ---- Create the request row in the API ----
        // console.log('aiText: ' + aiText)

        const createRes = await fetch(`${API_BASE}/requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
                name,
                dob,
                file: storedPath,
                text: extractedText,
                ai_text: aiText,
            }),
        });

        if (!createRes.ok) {
            const t = await createRes.text();
            return new Response(t || "Failed to create request", { status: createRes.status });
        }

        const row = await createRes.json();
        return Response.json(row, { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
    }
}