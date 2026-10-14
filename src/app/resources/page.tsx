import Link from "next/link";
import { connection } from "next/server";
import { listResources } from "@/server/services/resource-service";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import ResourceIcon from "@/components/ui/ResourceIcon";
import DeactivateResourceButton from "@/components/resources/DeactivateResourceButton";
import { button } from "@/components/ui/styles";
import { Plus, Users, Pencil, Calendar, Boxes } from "lucide-react";

export const instant = false;

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  await connection();
  const { type = "all", error } = await searchParams;
  const all = await listResources({ includeInactive: true });

  // Counts by category
  const roomCount = all.filter((r) => r.type === "room").length;
  const equipmentCount = all.filter((r) => r.type === "equipment").length;
  const vehicleCount = all.filter((r) => r.type === "vehicle").length;
  const allCount = all.length;

  const tabs = [
    { key: "all", label: "All Resources", count: allCount },
    { key: "room", label: "Rooms", count: roomCount },
    { key: "equipment", label: "Equipment", count: equipmentCount },
    { key: "vehicle", label: "Vehicles", count: vehicleCount },
  ];

  const filtered = all.filter((r) => (type === "all" ? true : r.type === type));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Rooms, equipment and vehicles that can be booked across the organization."
        action={
          <Link
            href="/resources/new"
            className={`${button("primary")} inline-flex items-center gap-1.5 shadow-sm`}
          >
            <Plus className="h-4 w-4" />
            <span>Add resource</span>
          </Link>
        }
      />

      {/* Colorful Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5 sm:w-fit shadow-xs">
        {tabs.map((t) => {
          const active = type === t.key;
          return (
            <Link
              key={t.key}
              href={`/resources?type=${t.key}`}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      {error && <Alert>{error}</Alert>}

      {/* Resource Cards List */}
      <div className="space-y-3.5">
        {filtered.map((r, i) => {
          const accentColor =
            r.type === "equipment"
              ? "bg-amber-500"
              : r.type === "vehicle"
              ? "bg-emerald-500"
              : "bg-indigo-500";

          return (
            <div
              key={r.id}
              style={{ "--i": i } as React.CSSProperties}
              className={`animate-fade-up hover-lift group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all ${
                !r.is_active ? "bg-slate-50/60 opacity-80" : ""
              }`}
            >
              {/* Left colorful accent bar */}
              <div
                className={`absolute inset-y-0 left-0 w-1.5 ${
                  r.is_active ? accentColor : "bg-slate-300"
                }`}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-1">
                <div className="flex items-start gap-4 min-w-0">
                  <ResourceIcon type={r.type} />

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/resources/${r.id}`}
                        className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors"
                      >
                        {r.name}
                      </Link>

                      <Badge
                        tone={
                          r.type === "equipment"
                            ? "amber"
                            : r.type === "vehicle"
                            ? "green"
                            : "blue"
                        }
                      >
                        {r.type}
                      </Badge>

                      {r.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                      {r.capacity ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          Capacity: {r.capacity} people
                        </span>
                      ) : (
                        <span>No capacity set</span>
                      )}
                      {r.description && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate max-w-md text-slate-600">{r.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <Link
                    href={`/resources/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Availability</span>
                  </Link>

                  <Link
                    href={`/resources/${r.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400" />
                    <span>Edit</span>
                  </Link>

                  <DeactivateResourceButton
                    resourceId={r.id}
                    resourceName={r.name}
                    isActive={r.is_active}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Boxes className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-800">No resources found</p>
            <p className="text-xs text-slate-400 mt-1">There are no resources under the &ldquo;{type}&rdquo; category.</p>
            <Link
              href="/resources/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add first resource</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}