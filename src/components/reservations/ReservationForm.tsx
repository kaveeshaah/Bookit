"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/server/action-utils";
import Alert from "@/components/ui/Alert";
import { button, cardStyle, inputStyle, labelStyle } from "@/components/ui/styles";

type Option = { id: number; name: string };
type Props = {
    action: (prev: FormState, formData: FormData) => Promise<FormState>;
    resources: Option[];
    users: Option[];
    defaultResourceId?: number;
};

export default function ReservationForm({ action, resources, users, defaultResourceId }: Props) {
    const [state, formAction, pending] = useActionState(action, {} as FormState);
    const v = state.values ?? {};
    const err = (f: string) =>
        state.fieldErrors?.[f]?.[0] && <p className="mt-1.5 text-sm text-rose-600">{state.fieldErrors[f]![0]}</p>;

    return (
        <form action={formAction} className={`${cardStyle} max-w-xl space-y-5 p-6`}>
            {state.error && <Alert>{state.error}</Alert>}

            <div>
                <label htmlFor="resource_id" className={labelStyle}>Resource</label>
                <select id="resource_id" name="resource_id" defaultValue={v.resource_id ?? defaultResourceId ?? ""} className={inputStyle}>
                    <option value="" disabled>Select a resource</option>
                    {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {err("resource_id")}
            </div>

            <div>
                <label htmlFor="user_id" className={labelStyle}>Booking as</label>
                <select id="user_id" name="user_id" defaultValue={v.user_id ?? ""} className={inputStyle}>
                    <option value="" disabled>Select a person</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {err("user_id")}
            </div>

            <div>
                <label htmlFor="title" className={labelStyle}>Purpose</label>
                <input id="title" name="title" placeholder="e.g. Weekly team sync" defaultValue={v.title} className={inputStyle} />
                {err("title")}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="start_time" className={labelStyle}>Start</label>
                    <input id="start_time" type="datetime-local" name="start_time" defaultValue={v.start_time} className={inputStyle} />
                    {err("start_time")}
                </div>
                <div>
                    <label htmlFor="end_time" className={labelStyle}>End</label>
                    <input id="end_time" type="datetime-local" name="end_time" defaultValue={v.end_time} className={inputStyle} />
                    {err("end_time")}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button disabled={pending} className={button("primary")}>
                    {pending ? "Booking..." : "Book resource"}
                </button>
                <Link href="/reservations" className={button("secondary")}>Cancel</Link>
            </div>
        </form>
    );
}