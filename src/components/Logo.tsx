export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bookit-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#bookit-g)" />
      <rect x="9" y="11" width="22" height="19" rx="4" fill="none" stroke="white" strokeWidth="2.2" />
      <path d="M9 17h22" stroke="white" strokeWidth="2.2" />
      <path d="M14 8.5v5M26 8.5v5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m15.5 24 3 3 6-6.5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
        Bookit
      </span>
    </span>
  );
}
