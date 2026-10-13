type Variant = "primary" | "secondary" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

export function button(variant: Variant = "primary", size: Size = "md") {
  return [base, sizes[size], variants[variant]].join(" ");
}

export const inputStyle =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export const labelStyle = "mb-1.5 block text-sm font-medium text-slate-700";

export const cardStyle = "rounded-xl border border-slate-200 bg-white shadow-sm";
