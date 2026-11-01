"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ParticleShape = "ribbon" | "drop" | "star" | "disc";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: ParticleShape;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  gravity: number;
}

const CELEBRATION_PALETTE = [
  "#FFC400", // Brand Gold
  "#FF7900", // Brand Orange
  "#16A34A", // Emerald Open
  "#34D399", // Fresh Mint
  "#2563EB", // Royal Blue
  "#102E4D", // Deep Navy
];

function drawTeardrop(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.45);
  ctx.bezierCurveTo(
    radius * 1.05,
    -radius * 0.25,
    radius * 1.05,
    radius * 1.05,
    0,
    radius * 1.05
  );
  ctx.bezierCurveTo(
    -radius * 1.05,
    radius * 1.05,
    -radius * 1.05,
    -radius * 0.25,
    0,
    -radius * 1.45
  );
  ctx.closePath();
  ctx.fill();
}

function drawFourPointStar(ctx: CanvasRenderingContext2D, size: number) {
  const outer = size;
  const inner = size * 0.36;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Full-viewport celebration overlay combining:
 * 1) Gentle top-to-bottom falling drops, ribbons, and sparkle stars across the screen
 * 2) Soft dual-side celebratory popper bursts
 * Smoothly fades out and unmounts after ~4.2 seconds.
 */
export default function PartyConfetti() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const shapes: ParticleShape[] = ["drop", "ribbon", "star", "disc"];

    // 1. Top-to-bottom falling celebration drops, ribbons & sparkles across the full width
    const topDropCount = 58;
    for (let i = 0; i < topDropCount; i++) {
      const shape = shapes[i % shapes.length];
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -15 - Math.random() * (window.innerHeight * 0.55),
        vx: (Math.random() - 0.5) * 0.9,
        vy: 1.8 + Math.random() * 2.6,
        w: shape === "ribbon" ? 8 + Math.random() * 5 : 4.5 + Math.random() * 3,
        h: shape === "ribbon" ? 4 + Math.random() * 2.5 : 4.5 + Math.random() * 3,
        color: CELEBRATION_PALETTE[i % CELEBRATION_PALETTE.length],
        rotation: Math.random() * Math.PI * 2,
        vRot:
          shape === "drop"
            ? (Math.random() - 0.5) * 0.02
            : (Math.random() - 0.5) * 0.09,
        opacity: 0.72 + Math.random() * 0.2,
        shape,
        swayAmp: 0.45 + Math.random() * 0.85,
        swaySpeed: 0.0022 + Math.random() * 0.0025,
        phase: Math.random() * Math.PI * 2,
        gravity: 0.022,
      });
    }

    // 2. Dual-side celebratory popper burst
    const popperCount = 30;
    for (let i = 0; i < popperCount; i++) {
      const fromLeft = i % 2 === 0;
      const originX = fromLeft
        ? window.innerWidth * 0.16
        : window.innerWidth * 0.84;
      const originY = window.innerHeight * 0.34;
      const angle = fromLeft
        ? -Math.PI / 3 + (Math.random() - 0.5) * 0.85
        : -(2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.85;
      const speed = 4 + Math.random() * 5.8;
      const shape: ParticleShape = i % 3 === 0 ? "star" : "ribbon";

      particles.push({
        x: originX + (Math.random() - 0.5) * 36,
        y: originY + (Math.random() - 0.5) * 28,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.6,
        w: 7 + Math.random() * 4.5,
        h: 3.8 + Math.random() * 2.5,
        color: CELEBRATION_PALETTE[(i + 2) % CELEBRATION_PALETTE.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.13,
        opacity: 0.82,
        shape,
        swayAmp: 0.3,
        swaySpeed: 0.003,
        phase: Math.random() * Math.PI * 2,
        gravity: 0.12,
      });
    }

    const startTime = performance.now();
    const durationMs = 4200; // Graceful ~4.2s celebration then clean stop
    let animId = 0;

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed >= durationMs) {
        setVisible(false);
        return;
      }

      const fadeProgress =
        elapsed > 2700 ? 1 - (elapsed - 2700) / (durationMs - 2700) : 1;

      for (const p of particles) {
        p.x += p.vx + Math.sin(elapsed * p.swaySpeed + p.phase) * p.swayAmp;
        p.y += p.vy;
        p.vy = Math.min(p.vy + p.gravity, 5.4);
        p.vx *= 0.992;
        p.rotation += p.vRot;

        if (p.y > canvas.height + 30) continue;

        const alpha = Math.max(0, p.opacity * fadeProgress);
        if (alpha <= 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.shape === "drop" ? p.vx * 0.08 : p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === "drop") {
          drawTeardrop(ctx, p.w * 0.62);
        } else if (p.shape === "star") {
          drawFourPointStar(ctx, p.w * 0.78);
        } else if (p.shape === "disc") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.48, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 1.8);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
    }, durationMs + 150);

    return () => {
      window.removeEventListener("resize", resize);
      window.clearTimeout(unmountTimer);
      cancelAnimationFrame(animId);
    };
  }, [mounted]);

  if (!mounted || !visible) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-screen h-screen z-[95]"
    />,
    document.body
  );
}
