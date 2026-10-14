"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Layers,
} from "lucide-react";
import { shiftDate, todayString } from "@/lib/dates";

type ResourceOption = {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
};

type Props = {
  resources: ResourceOption[];
  selectedResourceId?: number;
  date: string;
  formattedDate: string;
};

export default function CalendarControls({
  resources,
  selectedResourceId,
  date,
}: Props) {
  const router = useRouter();
  const today = todayString();
  const isToday = date === today;

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const base = "/calendar";
    if (val === "all") {
      router.push(`${base}?date=${date}`);
    } else {
      router.push(`${base}?resource=${val}&date=${date}`);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const resourceQuery = selectedResourceId ? `&resource=${selectedResourceId}` : "";
      router.push(`/calendar?date=${val}${resourceQuery}`);
    }
  };

  const prevDateUrl = `/calendar?date=${shiftDate(date, -1)}${
    selectedResourceId ? `&resource=${selectedResourceId}` : ""
  }`;
  const nextDateUrl = `/calendar?date=${shiftDate(date, 1)}${
    selectedResourceId ? `&resource=${selectedResourceId}` : ""
  }`;
  const todayDateUrl = `/calendar?date=${today}${
    selectedResourceId ? `&resource=${selectedResourceId}` : ""
  }`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm">
      {/* Left: Resource Dropdown Filter */}
      <div className="relative w-full sm:w-64">
        <Layers className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <select
          value={selectedResourceId ? String(selectedResourceId) : "all"}
          onChange={handleResourceChange}
          aria-label="Select resource"
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="all">All Resources</option>
          {resources.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.name} ({r.type}){!r.is_active ? " · Inactive" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Date Segmented Navigator & Date Input */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/60 p-0.5">
          <Link
            href={prevDateUrl}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-indigo-600 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <Link
            href={todayDateUrl}
            className={`inline-flex h-8 items-center px-3 text-xs font-semibold rounded-lg transition ${
              isToday
                ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-900/5 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            Today
          </Link>

          <Link
            href={nextDateUrl}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-indigo-600 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative flex items-center">
          <CalendarIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            aria-label="Select date"
            className="rounded-xl border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
