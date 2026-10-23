"use client";

import { useState } from "react";

export default function AdminLogin({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? `Login failed (${res.status}).`);
    } catch {
      setError("Request failed. Is the server running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-gray-200 font-mono flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow - keeps the admin panel visually on brand */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-emerald-500/20 blur-[160px] rounded-full pointer-events-none" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md border border-emerald-500/25 rounded-2xl bg-black/70 p-8 shadow-2xl"
      >
        <div className="flex gap-1.5 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <p className="ml-auto text-[10px] tracking-[3px] uppercase text-emerald-500">
            secure-shell
          </p>
        </div>

        <h1 className="text-emerald-400 text-xl mb-1">
          <span className="text-emerald-500">&gt;</span> ADMIN_ACCESS
        </h1>
        <p className="text-gray-500 text-xs mb-8">
          Enter the ADMIN_PASSWORD to open the control panel.
        </p>

        <label
          htmlFor="admin-password"
          className="block text-xs text-gray-500 uppercase tracking-widest mb-2"
        >
          password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full bg-black border border-emerald-500/30 rounded-lg px-4 py-3 pr-11 text-emerald-300 outline-none focus:border-emerald-500 transition-colors"
            placeholder="••••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-emerald-400 transition-colors"
          >
            {showPassword ? (
              // eye-off
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M19.542 19.542a10.05 10.05 0 001.05-1.542c-.48-1.613-1.3-3.039-2.36-4.207M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              // eye
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-xs text-red-400 border border-red-500/30 bg-red-500/5 rounded-lg px-3 py-2">
            ! {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="mt-6 w-full border border-emerald-500/40 bg-emerald-500/10 rounded-lg py-3 text-sm uppercase tracking-[2px] text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "authenticating..." : "> authenticate"}
        </button>

        <p className="mt-6 text-[10px] text-gray-600">
          Sessions last 7 days · wrong attempts are rate limited
        </p>
      </form>
    </main>
  );
}
