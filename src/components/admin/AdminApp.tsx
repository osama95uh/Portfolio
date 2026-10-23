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
    <main className="min-h-screen bg-zinc-950 text-gray-200 font-mono lg:flex">
      {/* ── Desktop sidebar (≥1024px) ── */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-64 shrink-0 border-r border-emerald-500/20 bg-black/60">
        <div className="px-5 py-5 border-b border-emerald-500/15">
          <p className="text-emerald-400 text-sm truncate">[root@portfolio]</p>
          <p className="text-gray-500 text-xs mt-1 truncate">~$ ./admin.sh</p>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          <SidebarItem
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0v-6a2 2 0 012-2h2a2 2 0 012 2v6m-8 0h8m-8 0v4m8-4v4M15 9a3 3 0 11-6 0 3 3 0 016 0zm6 3V7a2 2 0 00-2-2H5a2 2 0 00-2 2v5" /></svg>}
            label="VISITORS"
            hint="analytics + log"
            active={tab === "visitors"}
            onClick={() => setTab("visitors")}
          />
          <SidebarItem
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
            label="PROJECTS"
            hint="CMS manager"
            active={tab === "projects"}
            onClick={() => setTab("projects")}
          />
        </nav>

        <div className="mt-auto p-3 border-t border-emerald-500/15 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-emerald-300 hover:bg-white/5 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            view site ↗
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            logout
          </button>
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="flex-1 min-w-0 relative">
        {/* Mobile topbar (<1024px) */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-emerald-500/20 bg-black/80 backdrop-blur-md">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open the public site in a new tab"
                className="px-3 py-1.5 text-xs border border-emerald-500/20 text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors uppercase tracking-wider"
              >
                site ↗
              </a>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
              >
                logout
              </button>
            </nav>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {configError ? (
            <div className="border border-amber-500/30 rounded-xl bg-amber-500/5 p-5 text-sm text-amber-300 mb-6">
              <p className="font-bold mb-1">$ config_error</p>
              {configError}
            </div>
          ) : null}

          {tab === "visitors" ? <VisitorsPanel /> : <ProjectsPanel />}
        </div>
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
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider border rounded-lg transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
          : "border-emerald-500/20 text-gray-400 hover:text-emerald-300 hover:border-emerald-500/40"
      }`}
    >
      {children}
    </button>
  );
}

function SidebarItem({
  icon,
  label,
  hint,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 text-left border rounded-lg transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
          : "border-transparent text-gray-400 hover:text-emerald-300 hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="flex flex-col min-w-0">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span
          className={`text-[10px] normal-case tracking-normal ${
            active ? "text-emerald-500/80" : "text-gray-600"
          }`}
        >
          {hint}
        </span>
      </span>
    </button>
  );
}
