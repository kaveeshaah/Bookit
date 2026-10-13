import { OPEN_HOUR, CLOSE_HOUR, formatTime } from "@/lib/dates";

type Booking = { id: number; title: string; start_time: Date; end_time: Date };

const HOUR_MS = 3_600_000;
const hourLabel = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "AM" : "PM"}`;

export default function DayTimeline({ date, bookings }: { date: string; bookings: Booking[] }) {
  const dayStart = new Date(`${date}T00:00:00+05:30`).getTime();
  const open = dayStart + OPEN_HOUR * HOUR_MS;
  const close = dayStart + CLOSE_HOUR * HOUR_MS;
  const pct = (t: number) => ((Math.min(Math.max(t, open), close) - open) / (close - open)) * 100;
  const ticks = Array.from({ length: (CLOSE_HOUR - OPEN_HOUR) / 2 + 1 }, (_, i) => OPEN_HOUR + i * 2);

  return (
    <div className="px-3">
      <div className="relative h-14 overflow-hidden rounded-xl bg-emerald-50 ring-1 ring-inset ring-emerald-200">
        {bookings.map((b, i) => {
          const left = pct(b.start_time.getTime());
          const width = pct(b.end_time.getTime()) - left;
          if (width <= 0) return null;
          return (
            <div
              key={b.id}
              title={`${b.title} · ${formatTime(b.start_time)} – ${formatTime(b.end_time)}`}
              style={{ left: `${left}%`, width: `${width}%`, "--i": i } as React.CSSProperties}
              className="animate-grow-x absolute inset-y-1 flex items-center overflow-hidden rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-2 text-xs font-medium text-white shadow-sm"
            >
              <span className="truncate">{b.title}</span>
            </div>
          );
        })}
      </div>

      <div className="relative mt-2 h-4 text-xs text-slate-500">
        {ticks.map((h) => (
          <span key={h} className="absolute -translate-x-1/2"
                style={{ left: `${((h - OPEN_HOUR) / (CLOSE_HOUR - OPEN_HOUR)) * 100}%` }}>
            {hourLabel(h)}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-200" /> Free</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-500" /> Booked</span>
      </div>
    </div>
  );
}
