import type { ReactNode } from "react";
import CountUp from "./CountUp";

const tones = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function StatCard({
  label, value, hint, icon, tone = "indigo", index = 0,
}: {
  label: string; value: number; hint: string; icon: ReactNode;
  tone?: keyof typeof tones; index?: number;
}) {
  return (
    <div style={{ "--i": index } as React.CSSProperties}
         className="animate-fade-up hover-lift rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900"><CountUp value={value} /></p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}
