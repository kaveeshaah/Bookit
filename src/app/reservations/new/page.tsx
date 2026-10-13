import ReservationForm from "@/components/reservations/ReservationForm";
import { createReservationAction } from "@/server/actions/reservations";
import { listResources } from "@/server/services/resource-service";
import { listUsers } from "@/server/services/user-service";

export const instant = false;

export default async function NewReservationPage({
    searchParams,
}: {
    searchParams: Promise<{ resource?: string }>;
}) {
    const { resource } = await searchParams;
    const [resources, users] = await Promise.all([listResources(), listUsers()]);

    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-2xl font-bold">New reservation</h1>
            <ReservationForm
                action={createReservationAction}
                resources={resources}
                users={users}
                defaultResourceId={resource ? Number(resource) : undefined}
            />
        </main>
    );
}