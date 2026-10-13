"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resourceSchema } from "@/validation/resource";
import * as service from "@/server/services/resource-service";
import { friendlyError, type FormState } from "@/server/action-utils";

function parse(formData: FormData) {
    return resourceSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        description: formData.get("description") || undefined,
        capacity: formData.get("capacity"),
    });
}

export async function createResourceAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const values = Object.fromEntries(formData) as Record<string, string>;
    const parsed = parse(formData);
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };
    try {
        await service.createResource(parsed.data);
    } catch (e) {
        return { error: friendlyError(e), values };
    }
    revalidatePath("/resources");
    revalidatePath("/");
    redirect("/resources");
}

export async function updateResourceAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
    const values = Object.fromEntries(formData) as Record<string, string>;
    const parsed = parse(formData);
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };
    try {
        await service.updateResource(id, parsed.data);
    } catch (e) {
        return { error: friendlyError(e), values };
    }
    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
    revalidatePath("/");
    redirect("/resources");
}

export async function deactivateResourceAction(id: number): Promise<void> {
    try {
        await service.deactivateResource(id);
    } catch (e) {
        redirect(`/resources?error=${encodeURIComponent(friendlyError(e))}`);
    }
    revalidatePath("/resources");
    revalidatePath("/");
    redirect("/resources");
}

export async function reactivateResourceAction(id: number): Promise<void> {
    await service.reactivateResource(id);
    revalidatePath("/resources");
    revalidatePath("/");
    redirect("/resources");
}