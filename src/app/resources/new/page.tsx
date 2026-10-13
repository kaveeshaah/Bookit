import ResourceForm from "@/components/resources/ResourceForm";
import PageHeader from "@/components/ui/PageHeader";
import { createResourceAction } from "@/server/actions/resources";

export default function NewResourcePage() {
    return (
        <div>
            <PageHeader
                title="Add resource"
                description="Add a room, piece of equipment or vehicle that people can book."
            />
            <ResourceForm action={createResourceAction} submitLabel="Create resource" />
        </div>
    );
}