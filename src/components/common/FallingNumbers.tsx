"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  value: string;
}

export default function FallingNumbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const numbers = ["0", "1", "0", "1", "3", "7"];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimeout: NodeJS.Timeout;
    const resizeCanvas = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };

    window.addEventListener("resize", resizeCanvas, { passive: true });

    const particleCount = width < 768 ? 20 : 32;

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height * -1,
      size: Math.floor(Math.random() * 5 + 12),
      speed: Math.random() * 1.0 + 0.5,
      opacity: Math.random() * 0.35 + 0.1,
      value: numbers[Math.floor(Math.random() * numbers.length)],
    });

    const particles: Particle[] = Array.from({ length: particleCount }, createParticle);

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
      if (isTabVisible && !animationRef.current) {
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = () => {
      if (!isTabVisible) {
        animationRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Set common state once per frame instead of per-particle
      ctx.fillStyle = "#10b981";
      ctx.textAlign = "center";
      ctx.font = '13px "Geist Mono", monospace';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillText(p.value, p.x, p.y);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] opacity-50"
      style={{ willChange: "transform" }}
    />
  );
}