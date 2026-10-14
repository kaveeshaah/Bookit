"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { button } from "@/components/ui/styles";
import {
  Menu,
  X,
  LayoutDashboard,
  Boxes,
  CalendarDays,
  CalendarPlus,
  Calendar,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Resources", icon: Boxes },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/reservations", label: "Reservations", icon: CalendarDays },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-shadow">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <Link href="/" aria-label="Bookit home" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation Links (md and above) */}
        <div className="hidden md:flex items-center gap-1.5 ml-6">
          {links.map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Button */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href="/reservations/new"
            className={`${button("primary")} inline-flex items-center gap-1.5 shadow-sm shadow-indigo-500/20`}
          >
            <CalendarPlus className="h-4 w-4" />
            <span>New reservation</span>
          </Link>
        </div>

        {/* Mobile Right Controls: Quick Book + Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/reservations/new"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Book</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-700" />
            ) : (
              <Menu className="h-5 w-5 text-slate-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-2 pb-5 shadow-lg animate-fade-in">
          <div className="space-y-1">
            {links.map((l) => {
              const Icon = l.icon;
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/reservations/new"
              onClick={() => setMobileMenuOpen(false)}
              className={`${button("primary")} w-full justify-center flex items-center gap-2 py-3 shadow-md shadow-indigo-500/20`}
            >
              <CalendarPlus className="h-4 w-4" />
              <span>New reservation</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
