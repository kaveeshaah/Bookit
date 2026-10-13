import { db } from "@/lib/db";
import { ServiceError } from "./resource-service";
import type { ReservationInput } from "@/validation/reservation";
import { OPEN_HOUR, CLOSE_HOUR } from "@/lib/dates";

// Different Prisma versions surface Postgres errors differently, so check
// the error code and message wherever they might appear.
function isExclusionViolation(e: unknown): boolean {
    try {
        const text = `${String(e)} ${JSON.stringify(e, Object.getOwnPropertyNames(e as object))}`;
        return text.includes("23P01") || text.toLowerCase().includes("exclusion constraint");
    } catch {
        return false;
    }
}

export function listReservations() {
    return db.reservation.findMany({
        include: { resource: true, user: true },
        orderBy: { start_time: "desc" },
    });
}

export async function createReservation(data: ReservationInput) {
    const resource = await db.resource.findUnique({ where: { id: data.resource_id } });
    if (!resource) throw new ServiceError("Resource not found.");
    if (!resource.is_active) throw new ServiceError("This resource is inactive and can't be booked.");

    try {
        // The database exclusion constraint is the real guard against double-booking
        return await db.reservation.create({ data: { ...data, status: "confirmed" } });
    } catch (e) {
        if (isExclusionViolation(e)) {
            throw new ServiceError("That time slot is already booked for this resource. Please choose another time.");
        }
        throw e;
    }
}

export async function cancelReservation(id: number) {
    const r = await db.reservation.findUnique({ where: { id } });
    if (!r) throw new ServiceError("Reservation not found.");
    if (r.status === "cancelled") return r;
    if (r.end_time <= new Date()) throw new ServiceError("Past reservations can't be cancelled.");
    return db.reservation.update({ where: { id }, data: { status: "cancelled" } });
}

const HOUR_MS = 3_600_000;

export async function getDayAvailability(resourceId: number, dateStr: string) {
    const dayStart = new Date(`${dateStr}T00:00:00+05:30`);
    const dayEnd = new Date(dayStart.getTime() + 24 * HOUR_MS);

    const bookings = await db.reservation.findMany({
        where: {
            resource_id: resourceId,
            status: "confirmed",
            start_time: { lt: dayEnd },
            end_time: { gt: dayStart },
        },
        include: { user: true },
        orderBy: { start_time: "asc" },
    });

    // Walk through the day and collect the gaps between bookings
    const open = new Date(dayStart.getTime() + OPEN_HOUR * HOUR_MS);
    const close = new Date(dayStart.getTime() + CLOSE_HOUR * HOUR_MS);
    const free: { start: Date; end: Date }[] = [];
    let cursor = open;

    for (const b of bookings) {
        if (cursor < close && b.start_time > cursor) {
            free.push({ start: cursor, end: b.start_time < close ? b.start_time : close });
        }
        if (b.end_time > cursor) cursor = b.end_time;
    }
    if (cursor < close) free.push({ start: cursor, end: close });

    return { bookings, free };
}