import type { ReactNode } from "react";

export default function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {children}
    </div>
  );
}
