"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  value: string;
  rotation: number;
  rotationSpeed: number;
}

export default function FallingNumbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const numbers = ["1", "2", "3", "4", "5"];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Mobile/touch devices get a lighter pass (fewer particles, capped DPR,
    // 30fps) so the effect looks the same but costs far less GPU/CPU time.
    const lite =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const particleCount = lite ? 12 : 45;
    const frameSkip = lite ? 2 : 1; // mobile: draw every 2nd frame (~30fps)

    let logicalW = 0;
    let logicalH = 0;

    const resizeCanvas = () => {
      const dpr = lite
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : window.devicePixelRatio || 1;
      logicalW = window.innerWidth;
      logicalH = window.innerHeight;
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (): Particle => ({
      x: Math.random() * logicalW,
      y: Math.random() * logicalH * -1,
      size: Math.random() * 14 + 11,
      speed: Math.random() * 1.2 + 0.6,
      opacity: Math.random() * 0.4 + 0.15,
      value: numbers[Math.floor(Math.random() * numbers.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 1.5 - 0.75,
    });

    particlesRef.current = Array.from({ length: particleCount }, createParticle);

    let lastTime = 0;
    let frameCount = 0;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.7 || 1, 3); // delta-time factor
      lastTime = time;

      // On mobile, skip alternate frames - the slow drift is visually identical.
      frameCount++;
      if (frameCount % frameSkip === 0) {
        ctx.clearRect(0, 0, logicalW, logicalH);
        particlesRef.current.forEach((p) => {
          p.y += p.speed * dt;
          p.rotation += p.rotationSpeed * dt * 0.5;

          if (p.y > logicalH + 50) {
            p.y = -50;
            p.x = Math.random() * logicalW;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.font = `${p.size}px "Geist Mono", monospace`;
          ctx.fillStyle = "#10b981";
          ctx.fillText(p.value, 0, 0);
          ctx.restore();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Fully stop the loop while the tab is hidden (saves battery, zero visual cost).
    const handleVisibility = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      } else if (!animationRef.current) {
        lastTime = 0;
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] opacity-60"
    />
  );
}
