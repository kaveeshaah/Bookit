import Link from "next/link";
import { db } from "@/lib/db";
import { formatRange } from "@/lib/dates";
import { cancelReservationAction } from "@/server/actions/reservations";

export const instant = false;

export default async function ReservationsPage({
    searchParams,
}: {
    searchParams?: Promise<{ error?: string }>;
}) {
    const { error } = (await searchParams) ?? {};
    let reservations: Array<{
        id: number;
        title: string;
        start_time: Date;
        end_time: Date;
        status: string;
        resource: { name: string };
    }> = [];

    try {
        reservations = await db.reservation.findMany({
            orderBy: { start_time: "desc" },
            include: { resource: { select: { name: true } } },
        });
    } catch (e) {
        console.error(e);
    }

    return (
        <main className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/" className="text-sm text-blue-600 hover:underline">
                        &larr; Dashboard
                    </Link>
                    <h1 className="mt-2 text-2xl font-bold">Reservations</h1>
                </div>
                <Link
                    href="/reservations/new"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                    + New Reservation
                </Link>
            </div>

            {error && <p className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}

            <div className="divide-y rounded-lg border bg-white shadow-sm">
                {reservations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        No reservations scheduled yet.
                    </div>
                ) : (
                    reservations.map((res) => (
                        <div key={res.id} className="flex items-center justify-between p-4">
                            <div>
                                <h3 className="font-semibold text-slate-900">{res.title}</h3>
                                <p className="text-sm text-slate-500">Resource: {res.resource.name}</p>
                                <p className="text-xs text-slate-400">
                                    {formatRange(new Date(res.start_time), new Date(res.end_time))}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`rounded px-2 py-1 text-xs font-medium capitalize ${
                                        res.status === "confirmed"
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {res.status}
                                </span>
                                {res.status === "confirmed" && new Date(res.end_time) > new Date() && (
                                    <form action={cancelReservationAction.bind(null, res.id)}>
                                        <button className="text-sm text-red-600 hover:underline">
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
