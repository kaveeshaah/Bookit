"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { button } from "@/components/ui/styles";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/resources", label: "Resources" },
  { href: "/reservations", label: "Reservations" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="text-xl font-bold text-blue-600">Bookit</Link>
        <div className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/reservations/new" className={`${button("primary")} ml-auto`}>
          + New reservation
        </Link>
      </nav>
    </header>
  );
}
