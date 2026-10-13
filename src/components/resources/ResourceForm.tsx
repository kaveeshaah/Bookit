"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RESOURCE_TYPES } from "@/validation/resource";
import type { FormState } from "@/server/action-utils";
import Alert from "@/components/ui/Alert";
import { button, cardStyle, inputStyle, labelStyle } from "@/components/ui/styles";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  defaults?: { name?: string; type?: string; description?: string | null; capacity?: number | null };
};

export default function ResourceForm({ action, submitLabel, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const v = state.values;
  const err = (f: string) =>
    state.fieldErrors?.[f]?.[0] && <p className="mt-1.5 text-sm text-red-600">{state.fieldErrors[f]![0]}</p>;

  return (
    <form action={formAction} className={`${cardStyle} max-w-xl space-y-5 p-6`}>
      {state.error && <Alert>{state.error}</Alert>}

      <div>
        <label htmlFor="name" className={labelStyle}>Name</label>
        <input id="name" name="name" placeholder="e.g. Boardroom" defaultValue={v?.name ?? defaults?.name} className={inputStyle} />
        {err("name")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className={labelStyle}>Type</label>
          <select id="type" name="type" defaultValue={v?.type ?? defaults?.type ?? "room"} className={inputStyle}>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          {err("type")}
        </div>
        <div>
          <label htmlFor="capacity" className={labelStyle}>
            Capacity <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input id="capacity" name="capacity" type="number" min={1} placeholder="e.g. 10"
            defaultValue={v?.capacity ?? defaults?.capacity ?? ""} className={inputStyle} />
          {err("capacity")}
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelStyle}>
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea id="description" name="description" rows={3} placeholder="Anything people should know before booking"
          defaultValue={v?.description ?? defaults?.description ?? ""} className={inputStyle} />
        {err("description")}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button disabled={pending} className={button("primary")}>{pending ? "Saving..." : submitLabel}</button>
        <Link href="/resources" className={button("secondary")}>Cancel</Link>
      </div>
    </form>
  );
}