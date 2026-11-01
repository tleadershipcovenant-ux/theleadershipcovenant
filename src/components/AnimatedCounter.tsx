"use client";

import React, { useState, useEffect, useRef } from "react";

export default function AnimatedCounter({
  target,
  duration = 1.2,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Only start counter when scrolled into view, preventing CPU load during initial page load
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / (duration * 1000);
      const progress = Math.min(Math.max(elapsed, 0), 1);
      // Rapid running numbers settling into place smoothly
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(ease * target);
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, hasStarted]);

  return (
    <span ref={elementRef} className="font-num tabular-nums">
      {hasStarted ? count.toLocaleString() : "0"}
    </span>
  );
}
