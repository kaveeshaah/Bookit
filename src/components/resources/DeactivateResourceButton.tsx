"use client";

import { useState, useTransition } from "react";
import { deactivateResourceAction, reactivateResourceAction } from "@/server/actions/resources";
import Modal from "@/components/ui/Modal";
import { Power, PowerOff } from "lucide-react";

type Props = {
  resourceId: number;
  resourceName: string;
  isActive: boolean;
};

export default function DeactivateResourceButton({
  resourceId,
  resourceName,
  isActive,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        if (isActive) {
          await deactivateResourceAction(resourceId);
        } else {
          await reactivateResourceAction(resourceId);
        }
        setIsOpen(false);
      } catch (err) {
        console.error("Action failed", err);
        setIsOpen(false);
      }
    });
  };

  if (!isActive) {
    return (
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            await reactivateResourceAction(resourceId);
          });
        }}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
      >
        <Power className="h-3.5 w-3.5" />
        <span>{isPending ? "Reactivating..." : "Reactivate"}</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-xs transition hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
      >
        <PowerOff className="h-3.5 w-3.5 text-rose-500" />
        <span>Deactivate</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tone="warning"
        title="Deactivate resource?"
        description={`Are you sure you want to deactivate "${resourceName}"? Inactive resources cannot be booked by members until reactivated.`}
        confirmLabel="Yes, deactivate"
        cancelLabel="Keep active"
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
