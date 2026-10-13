import { notFound } from "next/navigation";
import ResourceForm from "@/components/resources/ResourceForm";
import { updateResourceAction } from "@/server/actions/resources";
import { getResource } from "@/server/services/resource-service";

export const instant = false;

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resource = await getResource(Number(id));
    if (!resource) notFound();

    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Edit {resource.name}</h1>
            <ResourceForm
                action={updateResourceAction.bind(null, resource.id)}
                submitLabel="Save changes"
                defaults={resource}
            />
        </main>
    );
}