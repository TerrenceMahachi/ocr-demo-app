'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearButton({ disabled }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [err, setErr] = useState('');
    const [done, setDone] = useState(false);

    async function onClear() {
        setErr('');
        setDone(false);
        if (!confirm('Please confirm that you want to delete all records?')) return;

        try {
            const res = await fetch('/api/records/clear', { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || `Failed: ${res.status}`);

            setDone(true);
            startTransition(() => router.refresh()); // reload server component list
        } catch (e) {
            setErr(e.message || String(e));
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onClear}
                disabled={disabled || pending}
                className="rounded-lg bg-red-600 text-white px-4 py-2 disabled:opacity-60 hover:bg-red-700"
                title="Delete all records"
            >
                {pending ? 'Clearing…' : 'Clear records'}
            </button>
            {done && <span className="text-sm text-green-700">All records cleared.</span>}
            {err && <span className="text-sm text-red-700">{err}</span>}
        </div>
    );
}