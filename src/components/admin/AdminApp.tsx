"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import ProjectsPanel from "./ProjectsPanel";
import VisitorsPanel from "./VisitorsPanel";

type SessionStatus = "loading" | "authed" | "guest";

export default function AdminApp() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [configError, setConfigError] = useState<string | null>(null);
  const [tab, setTab] = useState<"visitors" | "projects">("visitors");

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/visitors", { cache: "no-store" });
      if (res.ok) {
        if (res.status === 200) {
          // 200 with an error payload means authed but Supabase missing.
          const body = await res.json().catch(() => ({}));
          if (body?.error) {
            setConfigError(body.error);
            setStatus("authed");
            return;
          }
          setConfigError(null);
          setStatus("authed");
          return;
        }
      }
      if (res.status === 401) {
        setStatus("guest");
        return;
      }
      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        setConfigError(body?.error ?? "Server configuration error.");
        setStatus("authed");
        return;
      }
      setStatus("guest");
    } catch {
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSession();
  }, [checkSession]);

  const handleLoginSuccess = useCallback(() => {
    setConfigError(null);
    setStatus("authed");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setStatus("guest");
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-zinc-950 text-emerald-400 font-mono flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          $ ./admin.sh --authenticating
          <span className="animate-pulse">_</span>
        </div>
      </main>
    );
  }

  if (status === "guest") {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  // authed
  return (
    <main className="min-h-screen bg-zinc-950 text-gray-200 font-mono">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-emerald-500/20 bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-emerald-400 text-sm">[root@portfolio]</span>
            <span className="text-gray-500 text-sm hidden sm:inline">~$</span>
            <span className="text-gray-400 text-sm truncate">./admin.sh</span>
          </div>
          <nav className="flex items-center gap-2">
            <TabButton
              active={tab === "visitors"}
              onClick={() => setTab("visitors")}
            >
              VISITORS
            </TabButton>
            <TabButton
              active={tab === "projects"}
              onClick={() => setTab("projects")}
            >
              PROJECTS
            </TabButton>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
            >
              logout
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {configError ? (
          <div className="border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-300 mb-6">
            <p className="font-bold mb-1">$ config_error</p>
            {configError}
          </div>
        ) : null}

        {tab === "visitors" ? <VisitorsPanel /> : <ProjectsPanel />}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
          : "border-emerald-500/20 text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40"
      }`}
    >
      {children}
    </button>
  );
}
