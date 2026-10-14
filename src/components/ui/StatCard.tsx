import type { ReactNode } from "react";
import CountUp from "./CountUp";

const tones = {
  indigo: {
    iconBg: "bg-indigo-100 text-indigo-600 shadow-sm shadow-indigo-500/10",
    borderAccent: "border-t-indigo-500",
    gradientBg: "from-indigo-50/40 via-white to-white",
    hoverBorder: "hover:border-indigo-300",
  },
  emerald: {
    iconBg: "bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-500/10",
    borderAccent: "border-t-emerald-500",
    gradientBg: "from-emerald-50/40 via-white to-white",
    hoverBorder: "hover:border-emerald-300",
  },
  violet: {
    iconBg: "bg-violet-100 text-violet-600 shadow-sm shadow-violet-500/10",
    borderAccent: "border-t-violet-500",
    gradientBg: "from-violet-50/40 via-white to-white",
    hoverBorder: "hover:border-violet-300",
  },
  amber: {
    iconBg: "bg-amber-100 text-amber-600 shadow-sm shadow-amber-500/10",
    borderAccent: "border-t-amber-500",
    gradientBg: "from-amber-50/40 via-white to-white",
    hoverBorder: "hover:border-amber-300",
  },
};

export default function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "indigo",
  index = 0,
}: {
  label: string;
  value: number;
  hint: string;
  icon: ReactNode;
  tone?: keyof typeof tones;
  index?: number;
}) {
  const currentTone = tones[tone] ?? tones.indigo;

  return (
    <div
      style={{ "--i": index } as React.CSSProperties}
      className={`animate-fade-up hover-lift relative overflow-hidden rounded-2xl border border-slate-200/90 border-t-4 ${currentTone.borderAccent} bg-gradient-to-b ${currentTone.gradientBg} p-5 shadow-sm transition-all duration-200 ${currentTone.hoverBorder}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${currentTone.iconBg}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
        <CountUp value={value} />
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <span>{hint}</span>
      </div>
    </div>
  );
}
