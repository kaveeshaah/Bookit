"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormState } from "@/server/action-utils";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import { button, cardStyle, inputStyle, labelStyle } from "@/components/ui/styles";
import { Calendar, User, FileText, Clock, Check, X } from "lucide-react";

type Option = { id: number; name: string };
type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  resources: Option[];
  users: Option[];
  defaultResourceId?: number;
  defaults?: {
    start_time?: string;
    end_time?: string;
  };
};

export default function ReservationForm({
  action,
  resources,
  users,
  defaultResourceId,
  defaults,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const v = state.values ?? {};
  const err = (f: string) =>
    state.fieldErrors?.[f]?.[0] && (
      <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-rose-600 animate-fade-in">
        <X className="h-3.5 w-3.5" />
        {state.fieldErrors[f]![0]}
      </p>
    );

  const handleDiscardConfirm = () => {
    setShowCancelModal(false);
    router.push("/reservations");
  };

  return (
    <>
      <form
        key={state.values ? JSON.stringify(state.values) : "initial"}
        action={formAction}
        className={`${cardStyle} max-w-xl overflow-hidden border border-slate-200/90 shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Booking Details</h2>
            <p className="text-xs text-slate-500">Select resource, member, time window, and purpose</p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {state.error && <Alert>{state.error}</Alert>}

          <div>
            <label htmlFor="resource_id" className={`${labelStyle} flex items-center gap-1.5`}>
              <Calendar className="h-4 w-4 text-slate-400" />
              Resource <span className="text-rose-500">*</span>
            </label>
            <select
              id="resource_id"
              name="resource_id"
              defaultValue={v.resource_id ?? defaultResourceId ?? ""}
              className={`${inputStyle} transition-all cursor-pointer`}
              required
            >
              <option value="" disabled>
                Select a resource
              </option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {err("resource_id")}
          </div>

          <div>
            <label htmlFor="user_id" className={`${labelStyle} flex items-center gap-1.5`}>
              <User className="h-4 w-4 text-slate-400" />
              Booking as <span className="text-rose-500">*</span>
            </label>
            <select
              id="user_id"
              name="user_id"
              defaultValue={v.user_id ?? ""}
              className={`${inputStyle} transition-all cursor-pointer`}
              required
            >
              <option value="" disabled>
                Select a person
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {err("user_id")}
          </div>

          <div>
            <label htmlFor="title" className={`${labelStyle} flex items-center gap-1.5`}>
              <FileText className="h-4 w-4 text-slate-400" />
              Purpose <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              placeholder="e.g. Weekly team sync, Customer demo"
              defaultValue={v.title}
              className={`${inputStyle} transition-all`}
              required
            />
            {err("title")}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="start_time" className={`${labelStyle} flex items-center gap-1.5`}>
                <Clock className="h-4 w-4 text-slate-400" />
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="start_time"
                type="datetime-local"
                name="start_time"
                defaultValue={v.start_time ?? defaults?.start_time}
                className={`${inputStyle} transition-all`}
                required
              />
              {err("start_time")}
            </div>
            <div>
              <label htmlFor="end_time" className={`${labelStyle} flex items-center gap-1.5`}>
                <Clock className="h-4 w-4 text-slate-400" />
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="end_time"
                type="datetime-local"
                name="end_time"
                defaultValue={v.end_time ?? defaults?.end_time}
                className={`${inputStyle} transition-all`}
                required
              />
              {err("end_time")}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
            <button
              disabled={pending}
              className={`${button("primary")} inline-flex items-center gap-2`}
            >
              <Check className="h-4 w-4" />
              <span>{pending ? "Booking..." : "Book resource"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className={button("secondary")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Discard Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        tone="warning"
        title="Discard booking?"
        description="Are you sure you want to cancel? Any details entered will not be saved."
        confirmLabel="Yes, discard"
        cancelLabel="Continue booking"
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}