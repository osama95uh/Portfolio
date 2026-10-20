"use client";

import { useEffect, useState } from "react";

const LINES = [
  { prompt: "~", cmd: "boot --kernel portfolio.v2" },
  { prompt: "~", cmd: "load modules [auth, db, ui]" },
  { prompt: "~", cmd: "npm run dev" },
  { prompt: "~", cmd: "ping siamkhan.dev" },
];

const GRANT_LINE = "✔ ACCESS GRANTED — welcome, user.";

const GLITCH_CHARS = "!@#$%^&*<>?/\\|{}[]~`";

function glitch(text: string) {
  return text
    .split("")
    .map((c) =>
      Math.random() < 0.15
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : c,
    )
    .join("");
}

export default function Loader({ onFinish }: { onFinish: () => void }) {
  const [lines, setLines] = useState<{ prompt: string; cmd: string; done: boolean }[]>([]);
  const [currentCmd, setCurrentCmd] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showGrant, setShowGrant] = useState(false);
  const [grantText, setGrantText] = useState("");
  const [glitching, setGlitching] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onFinish();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onFinish]);

  // Type each command
  useEffect(() => {
    if (lineIndex >= LINES.length) return;
    if (charIndex < LINES[lineIndex].cmd.length) {
      const t = setTimeout(() => {
        setCurrentCmd((p) => p + LINES[lineIndex].cmd[charIndex]);
        setCharIndex((c) => c + 1);
      }, 18);
      return () => clearTimeout(t);
    } else {
      // Line done
      const t = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { ...LINES[lineIndex], done: true },
        ]);
        setCurrentCmd("");
        setCharIndex(0);
        setLineIndex((l) => l + 1);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [lineIndex, charIndex]);

  // After all lines, show ACCESS GRANTED with glitch
  useEffect(() => {
    if (lineIndex < LINES.length) return;

    setShowGrant(true);
    let i = 0;
    const type = setInterval(() => {
      if (i <= GRANT_LINE.length) {
        setGrantText(GRANT_LINE.slice(0, i));
        i++;
      } else {
        clearInterval(type);
        setGlitching(true);
        setTimeout(() => setGlitching(false), 400);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onFinish, 400);
        }, 700);
      }
    }, 22);

    return () => clearInterval(type);
  }, [lineIndex, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex items-center justify-center transition-opacity duration-400 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)",
        }}
      />

      {/* Skip Button */}
      <button
        onClick={onFinish}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 font-mono text-[10px] sm:text-[11px] text-gray-400 hover:text-emerald-400 border border-gray-800 hover:border-emerald-500/40 px-3 py-1.5 rounded transition-all uppercase tracking-widest bg-black/60 backdrop-blur-sm z-20 cursor-pointer"
      >
        Skip &rarr;
      </button>

      <div className="w-full max-w-lg px-4 sm:px-6 font-mono text-xs sm:text-sm">
        {/* Header */}
        <div className="text-emerald-500/50 mb-6 text-[11px] sm:text-xs tracking-widest">
          Siam Khan v3.0.0 — initializing...
        </div>

        {/* Completed lines */}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <span className="text-emerald-600 shrink-0">
              [{String(i + 1).padStart(2, "0")}]$
            </span>
            <span className="text-emerald-300">{line.cmd}</span>
            <span className="text-emerald-600 ml-auto text-xs">OK</span>
          </div>
        ))}

        {/* Current typing line */}
        {lineIndex < LINES.length && (
          <div className="flex gap-2 mb-1">
            <span className="text-emerald-600 shrink-0">
              [{String(lineIndex + 1).padStart(2, "0")}]$
            </span>
            <span className="text-emerald-300">
              {currentCmd}
              <span className="animate-pulse">▋</span>
            </span>
          </div>
        )}

        {/* ACCESS GRANTED */}
        {showGrant && (
          <div className="mt-4 text-emerald-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
            {glitching ? glitch(grantText) : grantText}
            {!glitching && grantText.length < GRANT_LINE.length && (
              <span className="animate-pulse">▋</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}