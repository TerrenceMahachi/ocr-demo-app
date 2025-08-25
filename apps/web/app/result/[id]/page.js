import { notFound } from "next/navigation";
// apps/web/app/result/[id]/page.js

// Server Component
const API_BASE = process.env.API_BASE || "http://localhost:4000";

function formatDate(d) {
  if (!d) return "—";
  // Accepts "YYYY-MM-DD" or ISO; formats to a friendly string
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d; // fallback to raw if parse fails
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getAge(d) {
  if (!d) return "—";
  const dob = new Date(d);
  if (Number.isNaN(dob.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : "—";
}

export default async function Result({ params }) {
  const id = Number(params.id);
  let row = null;

  if (Number.isFinite(id)) {
    const res = await fetch(`${API_BASE}/requests/${id}`, { cache: "no-store" });
    if (res.ok) {
      row = await res.json();
    } else if (res.status !== 404) {
      throw new Error(`API error ${res.status}`);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center rounded-2xl shadow bg-gray-50">
      <div className="w-full  p-6">
        <h1 className="text-2xl font-semibold text-black mb-5">{row.iD}. {row.name || "—"}</h1>
<hr></hr>
<br></br>
<br></br>
        {!row ? (
          <div className="p-4 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
            Record not found.
          </div>
        ) : (
          <div className="space-y-6 text-black">

            <dl className="grid grid-cols-2 sm:grid-cols-2 gap-x-8 gap-y-4">
             


              <div>
                <dt className="text-sm text-gray-500">Date of birth</dt>
                <dd className="mt-1 font-medium">{formatDate(row.dob)}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Age</dt>
                <dd className="mt-1 font-medium">{getAge(row.dob)}</dd>
              </div>

              

              {row.file && (
                <div className="sm:col-span-2 my-9">
                <dt className="text-sm text-gray-500">File</dt>
                <dd className="mt-2">
                  <div className="flex items-center gap-4 rounded-xl border bg-white  hover:shadow-md transition p-3">
                    {/* Thumbnail or placeholder */}
                    <a
                      href={row.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-28 h-28 flex-shrink-0"
                    >
                      {/^\/?uploads\/.*\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(row.file) ? (
                        <img
                          src={row.file}
                          alt="Uploaded preview"
                          className="h-full w-full object-cover rounded-lg border"
                        />
                      ) : (
                        <img
                          src="/uploads/pdf.webp" 
                          alt="PDF placeholder"
                          className="h-full w-full object-contain rounded-lg border bg-gray-50"
                        />
                      )}
                    </a>
              
                   
                    <div className="flex-1 space-y-1">
                      <h5 className="font-semibold text-gray-800">Uploaded File</h5>
                      <p className="text-sm text-gray-600">
                        {/^\/?uploads\/.*\.(pdf)$/i.test(row.file)
                          ? "PDF Document"
                          : "Image File"}
                      </p>
              
                      
                      <p className="text-xs text-gray-500">
                        {row.file_size
                          ? `${(row.file_size / 1024).toFixed(1)} KB`
                          : "Size unknown"}
                        {" • "}
                        Saved {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                      </p>
              
                      <div className="mt-2">
                        <a
                          href={row.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Click here to view file
                        </a>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              )}
            </dl>

            <section className="mb-9">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Extracted text</h2>
              {row.text ? (
                <pre className="whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-4 text-[13px] leading-relaxed max-h-64 overflow-auto">
                  {row.text}
                </pre>
              ) : (
                <p className="text-gray-500">No text extracted.</p>
              )}
            </section>
<br></br>
            <section>
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Extracted text (AI)</h2>
              {row.ai_text ? (
                <pre className="whitespace-pre-wrap break-words rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-[13px] leading-relaxed max-h-64 overflow-auto">
                  {row.ai_text}
                </pre>
              ) : (
                <p className="text-gray-500">No AI OCR text.</p>
              )}
            </section>
          </div>
        )}
        {row.created_at && (
                <div className="sm:col-span-2 my-7">
                  <dt className="text-sm text-gray-500">Record created on {formatDate(row.created_at)}</dt>
                </div>
              )}

        <a
          href="/"
          className="inline-block mt-6 rounded-lg border border-green-300 px-4 py-2 hover:border-green-700 transition duration-900"
        >
          Create new record
        </a>
        <a
          href="/records"
          className="inline-block mt-6 ms-5 rounded-lg border border-orange-300 px-4 py-2 hover:border-orange-800 transition"
        >
          View other records
        </a>
      </div>
    </main>
  );
}