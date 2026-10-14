import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import ResourceForm from "@/components/resources/ResourceForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateResourceAction } from "@/server/actions/resources";
import { getResource } from "@/server/services/resource-service";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const instant = false;

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const resource = await getResource(Number(id));
  if (!resource) notFound();

  return (
    <div className="max-w-4xl">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/resources" className="hover:text-indigo-600 transition-colors">
          Resources
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link href={`/resources/${resource.id}`} className="hover:text-indigo-600 transition-colors">
          {resource.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">Edit</span>
      </nav>

      <div className="mb-6">
        <PageHeader
          title={`Edit ${resource.name}`}
          description="Update resource details, capacity limits, and descriptions."
          action={
            <Link
              href={`/resources/${resource.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to availability</span>
            </Link>
          }
        />
      </div>

      <ResourceForm
        action={updateResourceAction.bind(null, resource.id)}
        submitLabel="Save changes"
        defaults={resource}
      />
    </div>
  );
}