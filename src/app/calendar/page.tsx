import Link from "next/link";
import { connection } from "next/server";
import PageHeader from "@/components/ui/PageHeader";
import CalendarControls from "@/components/calendar/CalendarControls";
import DayTimeline from "@/components/reservations/DayTimeline";
import ResourceIcon from "@/components/ui/ResourceIcon";
import Badge from "@/components/ui/Badge";
import CancelReservationButton from "@/components/reservations/CancelReservationButton";
import { listResources, getResource } from "@/server/services/resource-service";
import {
  getDayAvailability,
  getAllResourcesDayAvailability,
} from "@/server/services/reservation-service";
import { formatDate, formatTime, todayString } from "@/lib/dates";
import { button, cardStyle } from "@/components/ui/styles";
import {
  Calendar,
  Clock,
  CalendarCheck,
  CalendarX,
  User,
  Users,
  CalendarPlus,
  ArrowRight,
} from "lucide-react";

export const instant = false;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string; date?: string }>;
}) {
  await connection();
  const { resource: resourceParam, date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayString();
  const formattedDate = formatDate(new Date(`${date}T12:00:00+05:30`));

  const allResources = await listResources({ includeInactive: true });
  const selectedResourceId = resourceParam ? Number(resourceParam) : undefined;
  const selectedResource = selectedResourceId ? await getResource(selectedResourceId) : null;

  const now = new Date();

  // If a single resource is selected
  let singleAvailability = null;
  if (selectedResource) {
    singleAvailability = await getDayAvailability(selectedResource.id, date);
  }

  // If all resources overview
  let allAvailabilities = null;
  if (!selectedResource) {
    allAvailabilities = await getAllResourcesDayAvailability(date);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Calendar"
        description="Filter by resource and date to track scheduled bookings and open availability."
      />

      {/* Interactive Controls Bar: Resource Dropdown & Date Switcher */}
      <CalendarControls
        resources={allResources}
        selectedResourceId={selectedResourceId}
        date={date}
        formattedDate={formattedDate}
      />

      {/* VIEW A: Single Resource Selected */}
      {selectedResource && singleAvailability && (
        <div className="space-y-6 animate-fade-in">
          {/* Resource Details Header */}
          <div className={`${cardStyle} p-6 sm:p-7`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <ResourceIcon type={selectedResource.type} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedResource.name}
                    </h2>
                    <Badge
                      tone={
                        selectedResource.type === "equipment"
                          ? "amber"
                          : selectedResource.type === "vehicle"
                          ? "green"
                          : "blue"
                      }
                    >
                      {selectedResource.type}
                    </Badge>
                    {selectedResource.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <Badge tone="slate">Inactive</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    {selectedResource.capacity ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        Capacity: {selectedResource.capacity} people
                      </span>
                    ) : (
                      <span>No capacity limit specified</span>
                    )}
                    {selectedResource.description && (
                      <span>• {selectedResource.description}</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedResource.is_active && (
                <Link
                  href={`/reservations/new?resource=${selectedResource.id}&date=${date}`}
                  className={`${button("primary", "sm")} inline-flex items-center gap-1.5`}
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Book this resource</span>
                </Link>
              )}
            </div>
          </div>

          {/* Day Timeline */}
          <section className={`${cardStyle} p-6`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Day Schedule</h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {singleAvailability.bookings.length}{" "}
                {singleAvailability.bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>
            <DayTimeline date={date} bookings={singleAvailability.bookings} />
          </section>

          {/* Booked and Available Columns */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Booked Slots */}
            <section className={`${cardStyle} flex flex-col p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <CalendarX className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Booked Slots</h3>
                </div>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                  {singleAvailability.bookings.length}
                </span>
              </div>

              {singleAvailability.bookings.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <CalendarCheck className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-slate-800">No bookings on this date</p>
                  <p className="text-xs text-slate-400 mt-0.5">The entire schedule is open.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {singleAvailability.bookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/70 to-pink-50/30 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-rose-950">
                            {formatTime(b.start_time)} – {formatTime(b.end_time)}
                          </span>
                        </div>
                        <p className="mt-1 font-medium text-slate-800">{b.title}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{b.user.name}</span>
                        </div>
                      </div>

                      {b.end_time > now && (
                        <div className="shrink-0 pt-2 sm:pt-0">
                          <CancelReservationButton
                            reservationId={b.id}
                            reservationTitle={b.title}
                            resourceName={selectedResource.name}
                            variant="danger"
                            size="sm"
                            showIcon={true}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Available Windows */}
            <section className={`${cardStyle} flex flex-col p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Available Slots</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  {singleAvailability.free.length} free
                </span>
              </div>

              {singleAvailability.free.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <Clock className="h-8 w-8 text-rose-400 mb-2" />
                  <p className="text-sm font-medium text-slate-800">Fully booked for this day</p>
                  <p className="text-xs text-slate-400 mt-0.5">Choose another date or resource.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {singleAvailability.free.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/30 p-4 transition hover:border-emerald-200"
                    >
                      <div>
                        <p className="font-semibold text-emerald-950">
                          {formatTime(f.start)} – {formatTime(f.end)}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-700 font-medium">
                          Operating hours
                        </p>
                      </div>
                      {selectedResource.is_active && (
                        <Link
                          href={`/reservations/new?resource=${selectedResource.id}&start=${date}T${formatTime(
                            f.start
                          )
                            .replace(" AM", "")
                            .replace(" PM", "")
                            .padStart(5, "0")}&end=${date}T${formatTime(f.end)
                            .replace(" AM", "")
                            .replace(" PM", "")
                            .padStart(5, "0")}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Book slot →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {/* VIEW B: Master Schedule Matrix (All Resources Overview) */}
      {!selectedResource && allAvailabilities && (
        <section className={`${cardStyle} p-6 sm:p-7 space-y-6 animate-fade-in`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Organization Master Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Showing availability for all {allAvailabilities.length} resources on {formattedDate}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-200" /> Free
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-rose-500" /> Booked
              </span>
            </div>
          </div>

          <div className="space-y-6 divide-y divide-slate-100">
            {allAvailabilities.map(({ resource, bookings }, idx) => (
              <div key={resource.id} className={idx > 0 ? "pt-6" : ""}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <ResourceIcon type={resource.type} />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/calendar?resource=${resource.id}&date=${date}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {resource.name}
                        </Link>
                        <Badge
                          tone={
                            resource.type === "equipment"
                              ? "amber"
                              : resource.type === "vehicle"
                              ? "green"
                              : "blue"
                          }
                        >
                          {resource.type}
                        </Badge>
                        {!resource.is_active && <Badge tone="slate">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">
                        {resource.capacity ? `Capacity: ${resource.capacity} · ` : ""}
                        {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} today
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/calendar?resource=${resource.id}&date=${date}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 shadow-sm"
                    >
                      Detail View
                    </Link>
                    {resource.is_active && (
                      <Link
                        href={`/reservations/new?resource=${resource.id}&date=${date}`}
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                      >
                        + Book
                      </Link>
                    )}
                  </div>
                </div>

                {/* Day Timeline for this Resource */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <DayTimeline date={date} bookings={bookings} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
