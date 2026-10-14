"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { RESOURCE_TYPES } from "@/validation/resource";
import type { FormState } from "@/server/action-utils";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { button, cardStyle, inputStyle, labelStyle } from "@/components/ui/styles";
import { Check, X, Users, Tag, AlignLeft, Layers } from "lucide-react";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  defaults?: { name?: string; type?: string; description?: string | null; capacity?: number | null };
};

export default function ResourceForm({ action, submitLabel, defaults }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const initialType = (state.values?.type ?? defaults?.type ?? "room") as string;
  const [selectedType, setSelectedType] = useState<string>(initialType);

  const v = state.values;
  const err = (f: string) =>
    state.fieldErrors?.[f]?.[0] && (
      <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-rose-600 animate-fade-in">
        <X className="h-3.5 w-3.5" />
        {state.fieldErrors[f]![0]}
      </p>
    );

  const handleDiscardConfirm = () => {
    setShowCancelModal(false);
    router.push("/resources");
  };

  return (
    <>
      <form
        key={state.values ? JSON.stringify(state.values) : "initial"}
        action={formAction}
        className={`${cardStyle} max-w-xl overflow-hidden border border-slate-200/90 shadow-lg`}
      >
        {/* Visual Card Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 sm:p-6">
          <ResourceIcon type={selectedType} />
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {defaults?.name ? `Editing ${defaults.name}` : "Resource Details"}
            </h2>
            <p className="text-xs text-slate-500">
              Configure name, category, capacity and booking guidance
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {state.error && <Alert>{state.error}</Alert>}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className={`${labelStyle} flex items-center gap-1.5`}>
              <Tag className="h-4 w-4 text-slate-400" />
              Resource Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              placeholder="e.g. Boardroom, Main Projector, Van 01"
              defaultValue={v?.name ?? defaults?.name}
              className={`${inputStyle} transition-all duration-150 focus:ring-4`}
              required
            />
            {err("name")}
            <p className="mt-1 text-xs text-slate-400">Unique display name seen by all members</p>
          </div>

          {/* Type and Capacity Row */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className={`${labelStyle} flex items-center gap-1.5`}>
                <Layers className="h-4 w-4 text-slate-400" />
                Resource Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                defaultValue={v?.type ?? defaults?.type ?? "room"}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`${inputStyle} transition-all duration-150 capitalize cursor-pointer`}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              {err("type")}
              <p className="mt-1 text-xs text-slate-400">Affects filtering and icons</p>
            </div>

            <div>
              <label htmlFor="capacity" className={`${labelStyle} flex items-center gap-1.5`}>
                <Users className="h-4 w-4 text-slate-400" />
                Capacity <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                placeholder="e.g. 10"
                defaultValue={v?.capacity ?? defaults?.capacity ?? ""}
                className={`${inputStyle} transition-all duration-150`}
              />
              {err("capacity")}
              <p className="mt-1 text-xs text-slate-400">Max seats or quantity</p>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className={`${labelStyle} flex items-center gap-1.5`}>
              <AlignLeft className="h-4 w-4 text-slate-400" />
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="e.g. Includes 75-inch screen, whiteboard, and HDMI adapters. Please tidy up after use."
              defaultValue={v?.description ?? defaults?.description ?? ""}
              className={`${inputStyle} transition-all duration-150 leading-relaxed`}
            />
            {err("description")}
            <p className="mt-1 text-xs text-slate-400">Instructions or notes visible when booking</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
            <button
              disabled={pending}
              className={`${button("primary")} inline-flex items-center gap-2`}
            >
              <Check className="h-4 w-4" />
              <span>{pending ? "Saving..." : submitLabel}</span>
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

      {/* Discard Changes Pop-up Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        tone="warning"
        title="Discard changes?"
        description="Are you sure you want to cancel? Any unsaved changes made to this resource will be lost."
        confirmLabel="Yes, discard changes"
        cancelLabel="Keep editing"
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}