import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatRange } from "@/lib/dates";

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
        resource: { name: string };
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
                include: { resource: { select: { name: true } } },
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
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top Navigation */}
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
                            Bookit
                        </Link>
                        <nav className="flex gap-4 text-sm font-medium text-slate-600">
                            <Link href="/resources" className="transition hover:text-slate-900">
                                Resources
                            </Link>
                            <Link href="/reservations" className="transition hover:text-slate-900">
                                Reservations
                            </Link>
                        </nav>
                    </div>
                    <Link
                        href="/resources/new"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        + Add Resource
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                {/* Hero / Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Overview of resources, capacity, and upcoming bookings.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Resources
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <div className="text-3xl font-bold text-slate-900">{totalResources}</div>
                            <span className="text-xs font-medium text-slate-500">Managed</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Active Resources
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <div className="text-3xl font-bold text-emerald-600">{activeResources}</div>
                            <span className="text-xs font-medium text-emerald-600">Available for booking</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Upcoming Reservations
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <div className="text-3xl font-bold text-blue-600">{upcomingReservationsCount}</div>
                            <span className="text-xs font-medium text-blue-600">Confirmed</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Recent Resources */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Resources</h2>
                            <Link
                                href="/resources"
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                View all ({totalResources})
                            </Link>
                        </div>

                        {recentResources.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                <p className="text-sm text-slate-500">No resources found in the database.</p>
                                <Link
                                    href="/resources/new"
                                    className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Create First Resource
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
                                {recentResources.map((res) => (
                                    <div
                                        key={res.id}
                                        className="flex items-center justify-between p-4 transition hover:bg-slate-50"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/resources/${res.id}`}
                                                    className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                                                >
                                                    {res.name}
                                                </Link>
                                                {!res.is_active && (
                                                    <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                <span className="capitalize">{res.type}</span>
                                                {res.capacity && ` • Capacity: ${res.capacity}`}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/resources/${res.id}/edit`}
                                                className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Reservations List */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Upcoming Bookings</h2>
                            <Link
                                href="/reservations"
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {upcomingReservations.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                <p className="text-sm text-slate-500">No upcoming reservations.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingReservations.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="font-medium text-slate-900">{booking.title}</div>
                                        <div className="mt-1 text-xs text-slate-500">
                                            Resource: <span className="font-medium text-slate-700">{booking.resource.name}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-400">
                                            {formatRange(new Date(booking.start_time), new Date(booking.end_time))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
