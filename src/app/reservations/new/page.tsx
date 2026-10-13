import ReservationForm from "@/components/reservations/ReservationForm";
import PageHeader from "@/components/ui/PageHeader";
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
        <div>
            <PageHeader
                title="New reservation"
                description="Book a resource for a specific date and time."
            />
            <ReservationForm
                action={createReservationAction}
                resources={resources}
                users={users}
                defaultResourceId={resource ? Number(resource) : undefined}
            />
        </div>
    );
}