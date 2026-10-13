"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reservationSchema } from "@/validation/reservation";
import * as service from "@/server/services/reservation-service";
import { friendlyError, type FormState } from "@/server/action-utils";

export async function createReservationAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const values = Object.fromEntries(formData) as Record<string, string>;
    const parsed = reservationSchema.safeParse(values);
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };

    try {
        await service.createReservation(parsed.data);
    } catch (e) {
        return { error: friendlyError(e), values };
    }
    revalidatePath("/reservations");
    revalidatePath("/");
    redirect("/reservations");
}

export async function cancelReservationAction(id: number): Promise<void> {
    try {
        await service.cancelReservation(id);
    } catch (e) {
        redirect(`/reservations?error=${encodeURIComponent(friendlyError(e))}`);
    }
    revalidatePath("/reservations");
    revalidatePath("/");
    redirect("/reservations");
}