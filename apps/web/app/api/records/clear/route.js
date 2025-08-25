const API_BASE = process.env.API_BASE || "http://localhost:4000";

export async function DELETE() {
  const upstream = await fetch(`${API_BASE}/requests`, { method: "DELETE" });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}