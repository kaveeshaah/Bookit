import { connection } from "next/server";
import ReservationForm from "@/components/reservations/ReservationForm";
import PageHeader from "@/components/ui/PageHeader";
import { createReservationAction } from "@/server/actions/reservations";
import { listResources } from "@/server/services/resource-service";
import { listUsers } from "@/server/services/user-service";

export const instant = false;

export default async function NewReservationPage({
    searchParams,
}: {
    searchParams: Promise<{ resource?: string; date?: string; start?: string; end?: string }>;
}) {
    await connection();
    const { resource, date, start, end } = await searchParams;
    const [resources, users] = await Promise.all([listResources(), listUsers()]);

    const defaultStartTime = start || (date ? `${date}T09:00` : undefined);
    const defaultEndTime = end || (date ? `${date}T10:00` : undefined);

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
                defaults={{
                    start_time: defaultStartTime,
                    end_time: defaultEndTime,
                }}
            />
        </div>
    );
}