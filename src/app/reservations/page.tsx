import Link from "next/link";
import { connection } from "next/server";
import { listReservations } from "@/server/services/reservation-service";
import CancelReservationButton from "@/components/reservations/CancelReservationButton";
import { formatRange } from "@/lib/dates";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { button } from "@/components/ui/styles";
import { Clock, User, CalendarPlus, Calendar } from "lucide-react";

export const instant = false;

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; error?: string }>;
}) {
  await connection();
  const { view = "upcoming", error } = await searchParams;
  const all = await listReservations();
  const now = new Date();

  // Tab counts
  const upcomingCount = all.filter((r) => r.status === "confirmed" && r.end_time > now).length;
  const pastCount = all.filter((r) => r.status === "confirmed" && r.end_time <= now).length;
  const cancelledCount = all.filter((r) => r.status === "cancelled").length;
  const allCount = all.length;

  const views = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount, tone: "emerald" },
    { key: "past", label: "Past", count: pastCount, tone: "slate" },
    { key: "cancelled", label: "Cancelled", count: cancelledCount, tone: "rose" },
    { key: "all", label: "All", count: allCount, tone: "indigo" },
  ];

  const rows = all.filter((r) => {
    if (view === "cancelled") return r.status === "cancelled";
    if (view === "past") return r.status === "confirmed" && r.end_time <= now;
    if (view === "upcoming") return r.status === "confirmed" && r.end_time > now;
    return true;
  });

  if (view === "upcoming") {
    rows.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Track who has booked what, upcoming schedules, and reservation history."
      />

      {/* Colorful View Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5 sm:w-fit shadow-xs">
        {views.map((v) => {
          const active = view === v.key;
          return (
            <Link
              key={v.key}
              href={`/reservations?view=${v.key}`}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span>{v.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {v.count}
              </span>
            </Link>
          );
        })}
      </div>

      {error && <Alert>{error}</Alert>}

      {/* Reservation Cards List */}
      <div className="space-y-3.5">
        {rows.map((r, i) => {
          const upcoming = r.status === "confirmed" && r.end_time > now;
          const isCancelled = r.status === "cancelled";

          return (
            <div
              key={r.id}
              style={{ "--i": i } as React.CSSProperties}
              className={`animate-fade-up hover-lift group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all ${
                isCancelled ? "bg-slate-50/50 opacity-80" : ""
              }`}
            >
              {/* Left colorful accent bar */}
              <div
                className={`absolute inset-y-0 left-0 w-1.5 ${
                  isCancelled
                    ? "bg-rose-400"
                    : upcoming
                    ? "bg-gradient-to-b from-indigo-500 to-violet-600"
                    : "bg-slate-300"
                }`}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-1">
                <div className="flex items-start gap-4 min-w-0">
                  <ResourceIcon type={r.resource.type} />

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {r.title}
                      </h3>

                      {isCancelled ? (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          Cancelled
                        </span>
                      ) : upcoming ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          Completed
                        </span>
                      )}

                      <Badge
                        tone={
                          r.resource.type === "equipment"
                            ? "amber"
                            : r.resource.type === "vehicle"
                            ? "green"
                            : "blue"
                        }
                      >
                        {r.resource.type}
                      </Badge>
                    </div>

                    {/* Resource & User info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                      <Link
                        href={`/resources/${r.resource.id}`}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {r.resource.name}
                      </Link>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-slate-500 font-medium">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{r.user.name}</span>
                      </div>
                    </div>

                    {/* Time Window Badge */}
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20">
                        <Clock className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{formatRange(r.start_time, r.end_time)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <Link
                    href={`/calendar?resource=${r.resource.id}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300"
                  >
                    View schedule
                  </Link>
                  {upcoming && (
                    <CancelReservationButton
                      reservationId={r.id}
                      reservationTitle={r.title}
                      resourceName={r.resource.name}
                      variant="danger"
                      size="sm"
                      showIcon={true}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Calendar className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-800">
              No reservations found in &ldquo;{view}&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              There are no {view} bookings recorded yet. Create a new reservation to book any shared resource.
            </p>
            <Link
              href="/reservations/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Create reservation</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
