// Server Component
const API_BASE = process.env.API_BASE || "http://localhost:4000";

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString();
}

export default async function Records() {
  const res = await fetch(`${API_BASE}/requests`, { cache: "no-store" });
  const raw = res.ok ? await res.json() : [];
  // map iD -> id for convenience in JSX
  const rows = raw.map(r => ({ ...r, id: r.iD }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Records</h1>
          <span className="flex">
          <a href="/" className="inline-block me-4 rounded-lg border border-green-300 px-4 py-2 hover:border-green-500 transition">
           + Capture New Record
          </a>
          <ClearButton disabled={rows.length === 0} />
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="text-gray-600">
            No records yet.{" "}
            <a className="text-blue-600 hover:underline" href="/">
              Capture one
            </a>.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl text-black border bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">DOB</th>
                  <th className="px-4 py-3">Saved</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t last:border-b">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{fmtDate(r.dob)}</td>
                    <td className="px-4 py-3">{r.created_at}</td>
                    <td className="px-4 py-3">
                      {r.file ? (
                        <a
                          href={r.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View file
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/result/${r.id}`}
                        className="inline-block rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                        title="View details"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
       
        </div>
      </div>
    </div>
  );
}

// Inline import so the server component can render a client child
import ClearButton from "./ClearButton";