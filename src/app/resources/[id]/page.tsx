import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getResource } from "@/server/services/resource-service";
import { getDayAvailability } from "@/server/services/reservation-service";
import { formatDate, formatTime, todayString } from "@/lib/dates";
import { button, cardStyle } from "@/components/ui/styles";
import DayTimeline from "@/components/reservations/DayTimeline";
import DateNavigator from "@/components/resources/DateNavigator";
import ResourceIcon from "@/components/ui/ResourceIcon";
import Badge from "@/components/ui/Badge";
import CancelReservationButton from "@/components/reservations/CancelReservationButton";
import {
  ArrowLeft,
  Pencil,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Clock,
  User,
  Users,
} from "lucide-react";

export const instant = false;

export default async function ResourceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  await connection();
  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const resource = await getResource(Number(id));
  if (!resource) notFound();

  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayString();
  const { bookings, free } = await getDayAvailability(resource.id, date);
  const formattedDate = formatDate(new Date(`${date}T12:00:00+05:30`));
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to resources</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/resources/${resource.id}/edit`}
            className={`${button("secondary", "sm")} inline-flex items-center gap-1.5`}
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit resource</span>
          </Link>

          {resource.is_active && (
            <Link
              href={`/reservations/new?resource=${resource.id}`}
              className={`${button("primary", "sm")} inline-flex items-center gap-1.5 shadow-sm`}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Book this resource</span>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className={`${cardStyle} p-6 sm:p-7`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <ResourceIcon type={resource.type} />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {resource.name}
                </h1>
                <Badge tone={resource.type === "equipment" ? "amber" : "blue"}>
                  {resource.type}
                </Badge>
                {resource.is_active ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <Badge tone="slate">Inactive</Badge>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {resource.capacity ? (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    Capacity {resource.capacity} people
                  </span>
                ) : (
                  <span>No capacity limit specified</span>
                )}
              </div>

              {resource.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                  {resource.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Date Navigation Toolbar */}
      <DateNavigator
        resourceId={resource.id}
        date={date}
        formattedDate={formattedDate}
      />

      {/* Visual Day Timeline Card */}
      <section className={`${cardStyle} p-6`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Day at a glance</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} scheduled
          </span>
        </div>
        <DayTimeline date={date} bookings={bookings} />
      </section>

      {/* Booked and Available Breakdown Columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Booked Slots Column */}
        <section className={`${cardStyle} flex flex-col p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <CalendarX className="h-4 w-4" />
              </div>
              <h2 className="font-semibold text-slate-900">Booked Slots</h2>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
              {bookings.length}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <CalendarCheck className="h-8 w-8 text-emerald-500/70 mb-2" />
              <p className="text-sm font-medium text-slate-800">No bookings scheduled</p>
              <p className="text-xs text-slate-400 mt-0.5">The entire day is open for reservations.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => {
                const isUpcoming = b.end_time > now;
                return (
                  <li
                    key={b.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/70 to-pink-50/30 p-4 transition hover:border-rose-200 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-rose-950">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </span>
                        <span className="rounded-md bg-rose-200/60 px-1.5 py-0.5 text-[11px] font-semibold text-rose-800">
                          Booked
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-slate-800">{b.title}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{b.user.name}</span>
                      </div>
                    </div>

                    {isUpcoming && (
                      <div className="shrink-0 pt-2 sm:pt-0">
                        <CancelReservationButton
                          reservationId={b.id}
                          reservationTitle={b.title}
                          resourceName={resource.name}
                          variant="danger"
                          size="sm"
                          showIcon={true}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Free / Available Slots Column */}
        <section className={`${cardStyle} flex flex-col p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <h2 className="font-semibold text-slate-900">Available Time Windows</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              {free.length} free
            </span>
          </div>

          {free.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <Clock className="h-8 w-8 text-rose-400 mb-2" />
              <p className="text-sm font-medium text-slate-800">Fully booked for this day</p>
              <p className="text-xs text-slate-400 mt-0.5">Check adjacent dates or select another resource.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {free.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/30 p-4 transition hover:border-emerald-200"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-950">
                      {formatTime(f.start)} – {formatTime(f.end)}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-700 font-medium">
                      Operating hours (8:00 AM – 6:00 PM)
                    </p>
                  </div>
                  {resource.is_active && (
                    <Link
                      href={`/reservations/new?resource=${resource.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Book now →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}