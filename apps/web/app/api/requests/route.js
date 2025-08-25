const API_BASE = process.env.API_BASE || "http://localhost:4000";

export async function GET() {
  const upstream = await fetch(`${API_BASE}/requests`, { cache: "no-store" });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
}

export async function POST(req) {
  const body = await req.json();
  const upstream = await fetch(`${API_BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
}
