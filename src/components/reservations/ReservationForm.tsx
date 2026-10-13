"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/server/action-utils";

type Option = { id: number; name: string };
type Props = {
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    resources: Option[];
    users: Option[];
    defaultResourceId?: number;
};

const input = "w-full rounded border border-gray-300 px-3 py-2";

export default function ReservationForm({ action, resources, users, defaultResourceId }: Props) {
    const [state, formAction, pending] = useActionState(action, {} as FormState);
    const v = state.values ?? {};
    const err = (f: string) =>
        state.fieldErrors?.[f]?.[0] && <p className="mt-1 text-sm text-red-600">{state.fieldErrors[f]![0]}</p>;

    return (
        <form action={formAction} className="max-w-lg space-y-4">
            {state.error && <p className="rounded bg-red-50 p-3 text-red-700">{state.error}</p>}

            <div>
                <label className="mb-1 block font-medium">Resource</label>
                <select name="resource_id" defaultValue={v.resource_id ?? defaultResourceId ?? ""} className={input}>
                    <option value="" disabled>Select a resource</option>
                    {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {err("resource_id")}
            </div>

            <div>
                <label className="mb-1 block font-medium">Booking as</label>
                <select name="user_id" defaultValue={v.user_id ?? ""} className={input}>
                    <option value="" disabled>Select a person</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {err("user_id")}
            </div>

            <div>
                <label className="mb-1 block font-medium">Purpose</label>
                <input name="title" defaultValue={v.title} className={input} />
                {err("title")}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block font-medium">Start</label>
                    <input type="datetime-local" name="start_time" defaultValue={v.start_time} className={input} />
                    {err("start_time")}
                </div>
                <div>
                    <label className="mb-1 block font-medium">End</label>
                    <input type="datetime-local" name="end_time" defaultValue={v.end_time} className={input} />
                    {err("end_time")}
                </div>
            </div>

            <div className="flex gap-3">
                <button disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
                    {pending ? "Booking..." : "Book resource"}
                </button>
                <Link href="/reservations" className="px-4 py-2 text-gray-600">Cancel</Link>
            </div>
        </form>
    );
}