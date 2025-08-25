const API_BASE = process.env.API_BASE || "http://localhost:4000";

export async function GET(_req, { params }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400 });
  }
  const upstream = await fetch(`${API_BASE}/requests/${id}`, { cache: "no-store" });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
}
