import Link from "next/link";
import { listResources } from "@/server/services/resource-service";
import { deactivateResourceAction, reactivateResourceAction } from "@/server/actions/resources";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import ResourceIcon from "@/components/ui/ResourceIcon";
import { button, cardStyle } from "@/components/ui/styles";

export const instant = false;

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const resources = await listResources({ includeInactive: true });

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Rooms, equipment and vehicles that can be booked."
        action={<Link href="/resources/new" className={button("primary")}>+ Add resource</Link>}
      />

      {error && <Alert>{error}</Alert>}

      <div className={`${cardStyle} divide-y divide-slate-100`}>
        {resources.map((r, i) => (
          <div
            key={r.id}
            style={{ "--i": i } as React.CSSProperties}
            className={`animate-fade-up flex flex-wrap items-center justify-between gap-4 p-4 ${r.is_active ? "" : "bg-slate-50"}`}
          >
            <div className="flex min-w-0 items-center gap-4">
              <ResourceIcon type={r.type} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/resources/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {r.name}
                  </Link>
                  <Badge tone={r.type === "equipment" ? "amber" : "blue"}>{r.type}</Badge>
                  {!r.is_active && <Badge>Inactive</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {r.capacity ? `Capacity ${r.capacity}` : "No capacity set"}
                  {r.description ? ` · ${r.description}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/resources/${r.id}`} className={button("secondary", "sm")}>Availability</Link>
              <Link href={`/resources/${r.id}/edit`} className={button("secondary", "sm")}>Edit</Link>
              <form action={(r.is_active ? deactivateResourceAction : reactivateResourceAction).bind(null, r.id)}>
                <button className={button(r.is_active ? "danger" : "secondary", "sm")}>
                  {r.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">No resources yet. Add your first one to get started.</p>
        )}
      </div>
    </div>
  );
}