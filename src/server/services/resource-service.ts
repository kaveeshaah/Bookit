import { db } from "@/lib/db";
import type { ResourceInput } from "@/validation/resource";

export class ServiceError extends Error { }

export function listResources(opts: { includeInactive?: boolean } = {}) {
    return db.resource.findMany({
        where: opts.includeInactive ? {} : { is_active: true },
        orderBy: [{ is_active: "desc" }, { type: "asc" }, { name: "asc" }],
    });
}

export function getResource(id: number) {
    return db.resource.findUnique({ where: { id } });
}

export function createResource(data: ResourceInput) {
    return db.resource.create({
        data: { ...data, description: data.description ?? null, capacity: data.capacity ?? null },
    });
}

export function updateResource(id: number, data: ResourceInput) {
    return db.resource.update({
        where: { id },
        data: { ...data, description: data.description ?? null, capacity: data.capacity ?? null },
    });
}

export async function deactivateResource(id: number) {
    // Business rule: don't hide a resource that still has upcoming bookings
    const upcoming = await db.reservation.count({
        where: { resource_id: id, status: "confirmed", end_time: { gt: new Date() } },
    });
    if (upcoming > 0) {
        throw new ServiceError(
            `Can't deactivate: ${upcoming} upcoming reservation(s). Cancel them first.`,
        );
    }
    return db.resource.update({ where: { id }, data: { is_active: false } });
}

export function reactivateResource(id: number) {
    return db.resource.update({ where: { id }, data: { is_active: true } });
}