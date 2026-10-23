"use client";

import { useState } from "react";

export default function AdminLogin({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
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
        className="relative w-full max-w-md border border-emerald-500/25 bg-black/70 p-8 shadow-xl"
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

        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
          password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full bg-black border border-emerald-500/30 px-4 py-3 text-emerald-300 outline-none focus:border-emerald-500 transition-colors"
          placeholder="••••••••••••"
        />

        {error ? (
          <p className="mt-4 text-xs text-red-400 border border-red-500/30 bg-red-500/5 px-3 py-2">
            ! {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="mt-6 w-full border border-emerald-500/40 bg-emerald-500/10 py-3 text-sm uppercase tracking-[2px] text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
