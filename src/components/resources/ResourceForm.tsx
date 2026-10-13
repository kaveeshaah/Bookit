"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RESOURCE_TYPES } from "@/validation/resource";
import type { FormState } from "@/server/action-utils";

type Props = {
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    submitLabel: string;
    defaults?: { name?: string; type?: string; description?: string | null; capacity?: number | null };
};

const input = "w-full rounded border border-gray-300 px-3 py-2";

export default function ResourceForm({ action, submitLabel, defaults }: Props) {
    const [state, formAction, pending] = useActionState(action, {} as FormState);
    const err = (f: string) =>
        state.fieldErrors?.[f]?.[0] && <p className="mt-1 text-sm text-red-600">{state.fieldErrors[f]![0]}</p>;

    return (
        <form action={formAction} className="max-w-lg space-y-4">
            {state.error && <p className="rounded bg-red-50 p-3 text-red-700">{state.error}</p>}

            <div>
                <label className="mb-1 block font-medium">Name</label>
                <input name="name" defaultValue={defaults?.name} className={input} />
                {err("name")}
            </div>

            <div>
                <label className="mb-1 block font-medium">Type</label>
                <select name="type" defaultValue={defaults?.type ?? "room"} className={input}>
                    {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                    ))}
                </select>
                {err("type")}
            </div>

            <div>
                <label className="mb-1 block font-medium">Capacity (optional)</label>
                <input name="capacity" type="number" min={1} defaultValue={defaults?.capacity ?? ""} className={input} />
                {err("capacity")}
            </div>

            <div>
                <label className="mb-1 block font-medium">Description (optional)</label>
                <textarea name="description" rows={3} defaultValue={defaults?.description ?? ""} className={input} />
                {err("description")}
            </div>

            <div className="flex gap-3">
                <button disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
                    {pending ? "Saving..." : submitLabel}
                </button>
                <Link href="/resources" className="px-4 py-2 text-gray-600">Cancel</Link>
            </div>
        </form>
    );
}