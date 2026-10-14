"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

type ModalTone = "danger" | "warning" | "info";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  tone?: ModalTone;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isConfirming?: boolean;
  children?: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  tone = "warning",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isConfirming = false,
  children,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const toneConfig = {
    danger: {
      icon: AlertCircle,
      iconBg: "bg-rose-100 text-rose-600",
      buttonBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100 text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25",
    },
    info: {
      icon: HelpCircle,
      iconBg: "bg-indigo-100 text-indigo-600",
      buttonBg: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25",
    },
  }[tone];

  const ToneIcon = toneConfig.icon;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Full Viewport Dark Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box Centered in Viewport */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all animate-fade-up ring-1 ring-slate-900/10 sm:my-8"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneConfig.iconBg}`}>
            <ToneIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto cursor-pointer"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming}
              className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 sm:w-auto cursor-pointer ${toneConfig.buttonBg}`}
            >
              {isConfirming ? "Processing..." : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
