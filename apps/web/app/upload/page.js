import { redirect } from "next/navigation";

export default function Upload() {
  async function createRequest(formData) {
    "use server";
    const name = formData.get("name")?.toString() || "";
    const dob  = formData.get("dob")?.toString() || null;
    const text = formData.get("text")?.toString() || null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/requests`, {
      method: "POST",
      body: JSON.stringify({ name, dob, text }),
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to create");
    const row = await res.json();
    redirect(`/result/${row.iD}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">New OCR Request</h1>
      <form action={createRequest} className="space-y-3">
        <input name="name" placeholder="Name" className="border p-2 w-full" />
        <input name="dob" placeholder="YYYY-MM-DD" className="border p-2 w-full" />
        <textarea name="text" placeholder="Optional notes" className="border p-2 w-full" rows={5}></textarea>
        <button className="bg-black text-white px-4 py-2 rounded">Save</button>
      </form>
    </main>
  );
}
