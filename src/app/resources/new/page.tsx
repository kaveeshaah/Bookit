import ResourceForm from "@/components/resources/ResourceForm";
import { createResourceAction } from "@/server/actions/resources";

export default function NewResourcePage() {
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-2xl font-bold">Add resource</h1>
            <ResourceForm action={createResourceAction} submitLabel="Create resource" />
        </main>
    );
}