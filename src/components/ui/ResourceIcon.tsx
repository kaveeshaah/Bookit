import { DoorOpen, Projector, Car, Box } from "lucide-react";

const map = {
  room: { Icon: DoorOpen, cls: "bg-indigo-50 text-indigo-600" },
  equipment: { Icon: Projector, cls: "bg-amber-50 text-amber-600" },
  vehicle: { Icon: Car, cls: "bg-emerald-50 text-emerald-600" },
  other: { Icon: Box, cls: "bg-slate-100 text-slate-600" },
} as const;

export default function ResourceIcon({ type }: { type: string }) {
  const { Icon, cls } = map[type as keyof typeof map] ?? map.other;
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cls}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
}
