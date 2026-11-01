import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  tone?: "canvas" | "white" | "navy" | "mint" | "gradient";
  container?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Section({
  id,
  tone = "canvas",
  container = true,
  className = "",
  children,
  ...props
}: SectionProps) {
  const toneClasses = {
    canvas: "bg-canvas text-ink",
    white: "bg-white text-ink",
    navy: "bg-navy-radial text-white relative overflow-hidden",
    mint: "bg-mint-50 text-ink border-y border-line",
    gradient: "bg-gradient-to-b from-canvas via-mint-50 to-canvas text-ink",
  }[tone];

  return (
    <section id={id} className={`section relative ${toneClasses} ${className}`} {...props}>
      {container ? <div className="container-x">{children}</div> : children}
    </section>
  );
}
