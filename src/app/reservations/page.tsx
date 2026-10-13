import Link from "next/link";
import { listReservations } from "@/server/services/reservation-service";
import { cancelReservationAction } from "@/server/actions/reservations";
import { formatRange } from "@/lib/dates";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import { button, cardStyle } from "@/components/ui/styles";

export const instant = false;

const VIEWS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; error?: string }>;
}) {
  const { view = "upcoming", error } = await searchParams;
  const all = await listReservations();
  const now = new Date();

  const rows = all.filter((r) => {
    if (view === "cancelled") return r.status === "cancelled";
    if (view === "past") return r.status === "confirmed" && r.end_time <= now;
    if (view === "upcoming") return r.status === "confirmed" && r.end_time > now;
    return true;
  });
  if (view === "upcoming") rows.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Who has booked what, and when."
        action={<Link href="/reservations/new" className={button("primary")}>+ New reservation</Link>}
      />

      <div className="mb-4 flex gap-1 rounded-xl bg-slate-200/60 p-1 sm:w-fit">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/reservations?view=${v.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === v.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      <div className={`${cardStyle} divide-y divide-slate-100`}>
        {rows.map((r, i) => {
          const upcoming = r.status === "confirmed" && r.end_time > now;
          return (
            <div
              key={r.id}
              style={{ "--i": i } as React.CSSProperties}
              className="animate-fade-up flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  {r.status === "cancelled" ? (
                    <Badge tone="red">Cancelled</Badge>
                  ) : upcoming ? (
                    <Badge tone="green">Confirmed</Badge>
                  ) : (
                    <Badge>Completed</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{r.resource.name} · {r.user.name}</p>
                <p className="text-sm text-slate-500">{formatRange(r.start_time, r.end_time)}</p>
              </div>
              {upcoming && (
                <form action={cancelReservationAction.bind(null, r.id)}>
                  <button className={button("danger", "sm")}>Cancel booking</button>
                </form>
              )}
            </div>
          );
        })}
        {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nothing to show here.</p>}
      </div>
    </div>
  );
}
