"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [fileMeta, setFileMeta] = useState(null); // { name, size, type }
  const [previewUrl, setPreviewUrl] = useState(null); // blob url for images, placeholder for pdf

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "Unknown";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(1)} ${units[i]}`;
  }

  function isAllowed(f) {
    if (!f) return false;
    const t = f.type || "";
    return t === "application/pdf" || t.startsWith("image/");
  }

  function pickPreviewFor(file) {
    if (!file) return null;
    if (file.type === "application/pdf") return "/pdf-placeholder.png"; // keep this in /public
    if (file.type.startsWith("image/")) return URL.createObjectURL(file);
    return null;
  }

  function setFile(file) {
    if (!file) {
      setFileMeta(null);
      setPreviewUrl(null);
      return;
    }
    if (!isAllowed(file)) {
      setErr("File must PDF or image format.");
      setFileMeta(null);
      setPreviewUrl(null);
      return;
    }
    setErr("");
    setFileMeta({ name: file.name, size: file.size, type: file.type });
    setPreviewUrl(pickPreviewFor(file));
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    setFile(f || null);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      // if user dragged a file but didn't touch the input, ensure it’s in the form
      if (!fd.get("file") && fileInputRef.current?.files?.[0]) {
        fd.set("file", fileInputRef.current.files[0]);
      }
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Upload failed");
      }
      const row = await res.json();
      router.replace(`/result/${row.iD}`);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    setFileMeta(null);
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow p-6 border border-gray-100">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Enter record details</h1>
          <p className="text-sm text-gray-600 mt-1">
            Capture record details with a PDF or image for OCR.
          </p>
        </div>

        {err && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5 text-black">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium mb-1">
                Date of birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-medium mb-2">File (PDF or image)</label>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={[
                "rounded-xl border-2 border-dashed px-4 py-6 transition",
                isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
               
                <div className="w-20 h-20 rounded-lg border bg-white overflow-hidden flex-shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Selected file preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-gray-400 text-xs">
                      No file
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Drag & drop a file here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      browse
                    </button>
                    .
                  </p>
                  <p className="text-xs text-gray-500">
                    Accepted: PDF, PNG, JPG, WEBP, GIF • Max size ~10MB (recommended)
                  </p>

                  {fileMeta && (
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">{fileMeta.name}</span>{" "}
                      <span className="text-gray-500">• {formatBytes(fileMeta.size)}</span>
                    </p>
                  )}
                </div>

                {fileMeta && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    title="Remove file"
                  >
                    Remove
                  </button>
                )}
              </div>

            
              <input
                ref={fileInputRef}
                id="file"
                name="file"
                type="file"
                accept="application/pdf,image/*"
                onChange={onFileChange}
                className="sr-only"
              />
            </div>
          </div>

          
          <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-3">
            <div>
              <label htmlFor="use_ai" className="block text-sm font-medium">
                Use AI OCR (images only)
              </label>
              <p className="text-xs text-gray-600">
                Sends the image to your configured OCR service for improved extraction.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input id="use_ai" name="use_ai" type="checkbox" className="peer sr-only" />
              <label
                htmlFor="use_ai"
                className="block w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-blue-600 relative transition"
              >
                <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow peer-checked:translate-x-5 transition" />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}