import { notFound } from "next/navigation";
import ResourceForm from "@/components/resources/ResourceForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateResourceAction } from "@/server/actions/resources";
import { getResource } from "@/server/services/resource-service";

export const instant = false;

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resource = await getResource(Number(id));
    if (!resource) notFound();

    return (
        <div>
            <PageHeader title={`Edit ${resource.name}`} />
            <ResourceForm
                action={updateResourceAction.bind(null, resource.id)}
                submitLabel="Save changes"
                defaults={resource}
            />
        </div>
    );
}