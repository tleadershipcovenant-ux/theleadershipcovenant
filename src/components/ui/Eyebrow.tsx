import React from "react";

interface EyebrowProps {
  children: React.ReactNode;
  tone?: "teal" | "gold" | "dark" | "white";
  className?: string;
  icon?: React.ReactNode;
}

export function Eyebrow({ children, tone = "teal", className = "", icon }: EyebrowProps) {
  const toneClasses = {
    teal: "bg-mint-100 text-teal-800",
    gold: "bg-amber-100/90 text-amber-900 border border-amber-300/60",
    dark: "bg-white/10 text-seafoam border border-white/15",
    white: "bg-white text-navy-900 shadow-sm",
  }[tone];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] transition-all ${toneClasses} ${className}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
