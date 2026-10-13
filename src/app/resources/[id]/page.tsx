import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/server/services/resource-service";
import { getDayAvailability } from "@/server/services/reservation-service";
import { formatDate, formatTime, shiftDate, todayString } from "@/lib/dates";
import { button, cardStyle, inputStyle } from "@/components/ui/styles";
import DayTimeline from "@/components/reservations/DayTimeline";

export const instant = false;

export default async function ResourceDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ date?: string }>;
}) {
    const { id } = await params;
    const { date: dateParam } = await searchParams;

    const resource = await getResource(Number(id));
    if (!resource) notFound();

    const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayString();
    const { bookings, free } = await getDayAvailability(resource.id, date);
    const label = formatDate(new Date(`${date}T12:00:00+05:30`));
    const base = `/resources/${resource.id}`;

    return (
        <div>
            <Link href="/resources" className="text-sm font-medium text-indigo-600 hover:underline">← Resources</Link>

            <div className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{resource.name}</h1>
                    <p className="text-slate-600">
                        {resource.type}{resource.capacity ? ` · capacity ${resource.capacity}` : ""}
                        {!resource.is_active && " · inactive"}
                    </p>
                    {resource.description && <p className="mt-1 text-slate-600">{resource.description}</p>}
                </div>
                {resource.is_active && (
                    <Link href={`/reservations/new?resource=${resource.id}`} className={button("primary")}>
                        Book this resource
                    </Link>
                )}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Link href={`${base}?date=${shiftDate(date, -1)}`} className={button("secondary", "sm")}>← Prev</Link>
                <span className="min-w-32 text-center font-medium text-slate-900">{label}</span>
                <Link href={`${base}?date=${shiftDate(date, 1)}`} className={button("secondary", "sm")}>Next →</Link>
                <Link href={base} className="px-2 text-sm font-medium text-indigo-600 hover:underline">Today</Link>
                <form className="ml-auto flex gap-2">
                    <input type="date" name="date" defaultValue={date} className={inputStyle} />
                    <button className={button("secondary", "sm")}>Go</button>
                </form>
            </div>

            {/* Visual Day Timeline */}
            <section className={`${cardStyle} mb-6 p-5`}>
                <h2 className="mb-4 font-semibold text-slate-900">Day at a glance</h2>
                <DayTimeline date={date} bookings={bookings} />
            </section>

            <div className="grid gap-6 md:grid-cols-2">
                <section className={`${cardStyle} p-5`}>
                    <h2 className="mb-3 font-semibold text-slate-900">Booked</h2>
                    {bookings.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">No bookings this day.</p>
                    ) : (
                        <ul className="space-y-2">
                            {bookings.map((b) => (
                                <li key={b.id} className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-900">
                                    <p className="font-medium">{formatTime(b.start_time)} – {formatTime(b.end_time)}</p>
                                    <p className="text-sm">{b.title} · {b.user.name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className={`${cardStyle} p-5`}>
                    <h2 className="mb-3 font-semibold text-slate-900">Free (8:00 AM – 6:00 PM)</h2>
                    {free.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">Fully booked.</p>
                    ) : (
                        <ul className="space-y-2">
                            {free.map((f, i) => (
                                <li key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                                    {formatTime(f.start)} – {formatTime(f.end)}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}