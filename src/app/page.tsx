import Link from "next/link";
import { connection } from "next/server";
import {
  Boxes,
  BadgeCheck,
  CalendarCheck,
  Calendar,
  Clock,
  ArrowRight,
  CalendarPlus,
  Plus,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatRange } from "@/lib/dates";
import StatCard from "@/components/ui/StatCard";
import ResourceIcon from "@/components/ui/ResourceIcon";
import Badge from "@/components/ui/Badge";
import { button } from "@/components/ui/styles";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  let totalResources = 0;
  let activeResources = 0;
  let upcomingReservationsCount = 0;
  let recentResources: Array<{
    id: number;
    name: string;
    type: string;
    capacity: number | null;
    is_active: boolean;
  }> = [];
  let upcomingReservations: Array<{
    id: number;
    title: string;
    start_time: Date;
    end_time: Date;
    status: string;
    user: { name: string };
    resource: { name: string; type: string };
  }> = [];

  try {
    const [total, active, upcomingCount, resources, reservations] = await Promise.all([
      db.resource.count(),
      db.resource.count({ where: { is_active: true } }),
      db.reservation.count({
        where: { status: "confirmed", end_time: { gt: new Date() } },
      }),
      db.resource.findMany({
        orderBy: [{ is_active: "desc" }, { created_at: "desc" }],
        take: 6,
      }),
      db.reservation.findMany({
        where: { status: "confirmed", end_time: { gt: new Date() } },
        orderBy: { start_time: "asc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          resource: { select: { name: true, type: true } },
        },
      }),
    ]);

    totalResources = total;
    activeResources = active;
    upcomingReservationsCount = upcomingCount;
    recentResources = resources;
    upcomingReservations = reservations;
  } catch (error) {
    console.error("Dashboard fetch error:", error);
  }

  return (
    <div className="space-y-8">
      {/* Colorful Gradient Hero Section */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-indigo-500/20 sm:p-10">
        <div className="animate-float pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/3 h-40 w-40 rounded-full bg-cyan-400/15 blur-2xl" />

        <div className="relative max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Book smarter. Never double-book again.
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-indigo-100">
            Real-time availability, PostgreSQL collision-free protection, and seamless scheduling
            for all organizational assets.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/reservations/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-md shadow-black/10 transition-all hover:bg-indigo-50 hover:shadow-lg active:scale-[0.98]"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>New Reservation</span>
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-[0.98]"
            >
              <Boxes className="h-4 w-4" />
              <span>Browse Resources</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Colorful Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          label="Total resources"
          value={totalResources}
          hint="Managed organization assets"
          tone="indigo"
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          index={1}
          label="Active resources"
          value={activeResources}
          hint="Ready for instant booking"
          tone="emerald"
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <StatCard
          index={2}
          label="Upcoming reservations"
          value={upcomingReservationsCount}
          hint="Confirmed future slots"
          tone="violet"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
      </div>

      {/* Main Content: Resources and Upcoming Bookings */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Resources (2 Cols) */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold text-xs">
                R
              </span>
              <h2 className="text-lg font-bold text-slate-900">Shared Resources</h2>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>View all ({totalResources})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">No resources found in the database.</p>
              <Link
                href="/resources/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/25"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Resource</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
              {recentResources.map((res, i) => (
                <div
                  key={res.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="animate-fade-up flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-indigo-50/20"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <ResourceIcon type={res.type} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/resources/${res.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate"
                        >
                          {res.name}
                        </Link>
                        <Badge
                          tone={
                            res.type === "equipment"
                              ? "amber"
                              : res.type === "vehicle"
                              ? "green"
                              : "blue"
                          }
                        >
                          {res.type}
                        </Badge>
                        {res.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {res.capacity ? `Capacity: ${res.capacity} people` : "No capacity limit"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/resources/${res.id}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
                    >
                      Schedule
                    </Link>
                    {res.is_active && (
                      <Link
                        href={`/reservations/new?resource=${res.id}`}
                        className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Book
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings (1 Col) */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-violet-600 font-bold text-xs">
                B
              </span>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Bookings</h2>
            </div>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {upcomingReservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No upcoming reservations</p>
              <p className="text-xs text-slate-400 mt-0.5">Time slots are clear.</p>
              <Link
                href="/reservations/new"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Create reservation
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReservations.map((booking, i) => (
                <div
                  key={booking.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="animate-fade-up hover-lift group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white via-white to-violet-50/20 p-4 shadow-sm transition-all"
                >
                  {/* Left colorful accent line */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-600" />

                  <div className="pl-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {booking.title}
                      </h3>
                      <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Confirmed
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        {booking.resource.name}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">{booking.user.name}</span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50/80 rounded-lg px-2.5 py-1 w-fit">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatRange(
                          new Date(booking.start_time),
                          new Date(booking.end_time)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
