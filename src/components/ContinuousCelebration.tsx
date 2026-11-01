"use client";

import React, { useEffect, useRef } from "react";

type ParticleShape = "ribbon" | "star" | "disc" | "drop";

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
}

const CELEBRATION_PALETTE = [
  "#FFC400", // Brand Gold
  "#FF7900", // Brand Orange
  "#16A34A", // Emerald
  "#34D399", // Mint
  "#38BDF8", // Sky Blue
  "#102E4D", // Deep Navy
];

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const outer = size;
  const inner = size * 0.4;
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
 * Continuous, lightweight ambient celebratory particle animation.
 * Scoped inside the card container with zero page layout impact and low CPU footprint.
 */
export default function ContinuousCelebration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const shapes: ParticleShape[] = ["ribbon", "star", "disc", "drop"];
    const count = 36; // Ideal balance: rich visual celebration with ultra-low CPU

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", onResize);

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const shape = shapes[i % shapes.length];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.9 + Math.random() * 1.6,
        w: shape === "ribbon" ? 7 + Math.random() * 4 : 4 + Math.random() * 3,
        h: shape === "ribbon" ? 3.5 + Math.random() * 2 : 4 + Math.random() * 3,
        color: CELEBRATION_PALETTE[i % CELEBRATION_PALETTE.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.06,
        opacity: 0.65 + Math.random() * 0.3,
        shape,
        swayAmp: 0.4 + Math.random() * 0.6,
        swaySpeed: 0.002 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = performance.now();
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.6, 2.5);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(now * p.swaySpeed + p.phase) * p.swayAmp) * dt;
        p.rotation += p.vRot * dt;

        // Continuous wrap-around to top
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx, p.w * 0.7);
        } else if (p.shape === "disc") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "drop") {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w * 0.35, p.h * 0.65, p.rotation * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 1.5);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 rounded-2xl sm:rounded-3xl"
    />
  );
}

