"use client";

import React, { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "up" | "left" | "right" | "zoom";
  delayMs?: number;
  className?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  animation = "up",
  delayMs = 0,
  className = "",
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      data-reveal={animation === "up" ? "" : animation}
      style={{ ["--reveal-delay" as string]: `${delayMs}ms` }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Global initializer for any elements using `data-reveal` directly without component wrapper */
export function ScrollRevealWatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
