import Link from "next/link";
import { connection } from "next/server";
import { Boxes, BadgeCheck, CalendarCheck } from "lucide-react";
import { db } from "@/lib/db";
import { formatRange } from "@/lib/dates";
import StatCard from "@/components/ui/StatCard";

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
        <div>
            {/* Hero Section */}
            <section className="animate-fade-up relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-indigo-500/20 sm:p-10">
                <div className="animate-float pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />
                <div className="relative max-w-xl">
                    <p className="text-sm font-medium text-indigo-100">Resource reservation made simple</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Book smarter. Never double-book again.
                    </h1>
                    <p className="mt-3 text-indigo-100">
                        See what's available, reserve in seconds, and keep every booking in one place.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href="/reservations/new"
                            className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-[0.98]"
                        >
                            Book a resource
                        </Link>
                        <Link
                            href="/resources"
                            className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
                        >
                            Browse resources
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
                <StatCard
                    index={0}
                    label="Total resources"
                    value={totalResources}
                    hint="Managed"
                    icon={<Boxes className="h-5 w-5" />}
                />
                <StatCard
                    index={1}
                    label="Active resources"
                    value={activeResources}
                    hint="Available for booking"
                    tone="emerald"
                    icon={<BadgeCheck className="h-5 w-5" />}
                />
                <StatCard
                    index={2}
                    label="Upcoming reservations"
                    value={upcomingReservationsCount}
                    hint="Confirmed"
                    tone="violet"
                    icon={<CalendarCheck className="h-5 w-5" />}
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Recent Resources */}
                <div className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Resources</h2>
                        <Link
                            href="/resources"
                            className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                            View all ({totalResources})
                        </Link>
                    </div>

                    {recentResources.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                            <p className="text-sm text-slate-500">No resources found in the database.</p>
                            <Link
                                href="/resources/new"
                                className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Create First Resource
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            {recentResources.map((res, i) => (
                                <div
                                    key={res.id}
                                    style={{ "--i": i } as React.CSSProperties}
                                    className="animate-fade-up flex items-center justify-between p-4 transition hover:bg-slate-50"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/resources/${res.id}`}
                                                className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                                            >
                                                {res.name}
                                            </Link>
                                            {!res.is_active && (
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
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
                                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
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
                            className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {upcomingReservations.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                            <p className="text-sm text-slate-500">No upcoming reservations.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingReservations.map((booking, i) => (
                                <div
                                    key={booking.id}
                                    style={{ "--i": i } as React.CSSProperties}
                                    className="animate-fade-up hover-lift rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
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
        </div>
    );
}
