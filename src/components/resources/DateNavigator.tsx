"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { shiftDate, todayString } from "@/lib/dates";

type Props = {
  resourceId: number;
  date: string;
  formattedDate: string;
};

export default function DateNavigator({ resourceId, date, formattedDate }: Props) {
  const router = useRouter();
  const today = todayString();
  const isToday = date === today;
  const base = `/resources/${resourceId}`;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      router.push(`${base}?date=${val}`);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-sm">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Link
          href={`${base}?date=${shiftDate(date, -1)}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Previous day"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <Link
          href={base}
          className={`inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold transition shadow-sm ${
            isToday
              ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-500/30"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
          }`}
        >
          Today
        </Link>

        <Link
          href={`${base}?date=${shiftDate(date, 1)}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Next day"
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>

        <div className="ml-2 flex items-center gap-2">
          <span className="text-base font-semibold text-slate-900">{formattedDate}</span>
          {isToday && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Current day
            </span>
          )}
        </div>
      </div>

      {/* Date Picker Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <CalendarIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="date"
            name="date"
            value={date}
            onChange={handleDateChange}
            aria-label="Jump to specific date"
            className="rounded-xl border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </div>
  );
}
