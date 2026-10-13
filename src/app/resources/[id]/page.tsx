import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/server/services/resource-service";
import { getDayAvailability } from "@/server/services/reservation-service";
import { formatDate, formatTime, shiftDate, todayString } from "@/lib/dates";

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
        <main className="mx-auto max-w-4xl p-6">
            <Link href="/resources" className="text-sm text-blue-600">← Resources</Link>

            <div className="mb-6 mt-2 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{resource.name}</h1>
                    <p className="text-gray-600">
                        {resource.type}{resource.capacity ? ` · capacity ${resource.capacity}` : ""}
                        {!resource.is_active && " · inactive"}
                    </p>
                    {resource.description && <p className="mt-1 text-gray-600">{resource.description}</p>}
                </div>
                {resource.is_active && (
                    <Link href={`/reservations/new?resource=${resource.id}`} className="rounded bg-blue-600 px-4 py-2 text-white">
                        Book this resource
                    </Link>
                )}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Link href={`${base}?date=${shiftDate(date, -1)}`} className="rounded border px-3 py-1">← Prev</Link>
                <span className="min-w-32 text-center font-medium">{label}</span>
                <Link href={`${base}?date=${shiftDate(date, 1)}`} className="rounded border px-3 py-1">Next →</Link>
                <Link href={base} className="px-2 text-blue-600">Today</Link>
                <form className="ml-auto flex gap-2">
                    <input type="date" name="date" defaultValue={date} className="rounded border px-2 py-1" />
                    <button className="rounded border px-3 py-1">Go</button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <section>
                    <h2 className="mb-2 font-semibold">Booked</h2>
                    {bookings.length === 0 ? (
                        <p className="rounded border border-dashed p-4 text-gray-500">No bookings this day.</p>
                    ) : (
                        <ul className="space-y-2">
                            {bookings.map((b) => (
                                <li key={b.id} className="rounded border border-red-200 bg-red-50 p-3 text-red-900">
                                    <p className="font-medium">{formatTime(b.start_time)} – {formatTime(b.end_time)}</p>
                                    <p className="text-sm">{b.title} · {b.user.name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2 className="mb-2 font-semibold">Free (8:00 AM – 6:00 PM)</h2>
                    {free.length === 0 ? (
                        <p className="rounded border border-dashed p-4 text-gray-500">Fully booked.</p>
                    ) : (
                        <ul className="space-y-2">
                            {free.map((f, i) => (
                                <li key={i} className="rounded border border-green-200 bg-green-50 p-3 text-green-900">
                                    {formatTime(f.start)} – {formatTime(f.end)}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}