"use client";

import { useState, useTransition } from "react";
import { cancelReservationAction } from "@/server/actions/reservations";
import Modal from "@/components/ui/Modal";
import { button } from "@/components/ui/styles";
import { Trash2 } from "lucide-react";

type Props = {
  reservationId: number;
  reservationTitle: string;
  resourceName?: string;
  variant?: "danger" | "secondary";
  size?: "sm" | "md";
  showIcon?: boolean;
};

export default function CancelReservationButton({
  reservationId,
  reservationTitle,
  resourceName,
  variant = "danger",
  size = "sm",
  showIcon = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await cancelReservationAction(reservationId);
        setIsOpen(false);
      } catch (err) {
        console.error("Failed to cancel reservation", err);
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={`${button(variant, size)} inline-flex items-center gap-1.5`}
      >
        {showIcon && <Trash2 className="h-3.5 w-3.5" />}
        <span>{isPending ? "Cancelling..." : "Cancel booking"}</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tone="danger"
        title="Cancel reservation?"
        description={`Are you sure you want to cancel "${reservationTitle}"${
          resourceName ? ` for ${resourceName}` : ""
        }? This will free up the time slot for others.`}
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep reservation"
        isConfirming={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
