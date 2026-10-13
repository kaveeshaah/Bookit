import Link from "next/link";
import { listResources } from "@/server/services/resource-service";
import { deactivateResourceAction, reactivateResourceAction } from "@/server/actions/resources";

export const instant = false;

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const resources = await listResources({ includeInactive: true });

    return (
        <main className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Resources</h1>
                <Link href="/resources/new" className="rounded bg-blue-600 px-4 py-2 text-white">Add resource</Link>
            </div>

            {error && <p className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}

            <ul className="divide-y rounded border">
                {resources.map((r) => (
                    <li key={r.id} className={`flex items-center justify-between gap-4 p-4 ${r.is_active ? "" : "bg-gray-50 text-gray-500"}`}>
                        <div className="min-w-0">
                            <Link href={`/resources/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                            <p className="text-sm">
                                {r.type}{r.capacity ? ` · capacity ${r.capacity}` : ""}{r.is_active ? "" : " · inactive"}
                            </p>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <Link href={`/resources/${r.id}/edit`} className="text-blue-600">Edit</Link>
                            <form action={(r.is_active ? deactivateResourceAction : reactivateResourceAction).bind(null, r.id)}>
                                <button className="text-red-600">{r.is_active ? "Deactivate" : "Reactivate"}</button>
                            </form>
                        </div>
                    </li>
                ))}
                {resources.length === 0 && <li className="p-4 text-gray-500">No resources yet.</li>}
            </ul>
        </main>
    );
}