"use client";

import { useEffect, useState } from "react";
import {
  formatDhakaTime,
  formatGeo,
  mapsLink,
  type Tally,
  type VisitorRow,
  type VisitorStats,
} from "./adminTypes";

export default function VisitorsPanel() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [rows, setRows] = useState<VisitorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/visitors", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? `Failed to load (${res.status}).`);
        return;
      }
      setStats(body.stats ?? null);
      setRows(body.rows ?? []);
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetch("/api/admin/visitors", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => {
          if (b) {
            setStats(b.stats ?? null);
            setRows(b.rows ?? []);
          }
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const exportCsv = () => {
    if (!rows.length) return;
    const cols: (keyof VisitorRow)[] = [
      "created_at",
      "path",
      "ip",
      "country",
      "city",
      "browser",
      "os",
      "device",
      "isp",
      "visitor_id",
    ];
    const esc = (v: unknown) =>
      `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    const csv = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => esc(r[c])).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = query.trim()
    ? rows.filter((r) => {
        const q = query.toLowerCase();
        return [r.ip, r.path, r.country, r.city, r.browser, r.os, r.device, r.visitor_id, r.referer]
          .some((v) => (v ?? "").toLowerCase().includes(q));
      })
    : rows;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-emerald-400 text-lg">
            <span className="text-emerald-500">&gt;</span> VISITOR_INTEL
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Aggregates cover the latest {rows.length} page loads (log shows the
            newest first).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 text-xs border border-emerald-500/20 rounded-lg text-gray-400 cursor-pointer select-none hover:border-emerald-500/40 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-emerald-500 w-3.5 h-3.5"
            />
            auto-refresh 30s
          </label>
          <button
            onClick={exportCsv}
            disabled={!rows.length}
            className="px-3 py-1.5 text-xs border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider disabled:opacity-40"
          >
            export csv
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1.5 text-xs border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider disabled:opacity-40"
          >
            {loading ? "scanning..." : "refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-400 border border-red-500/30 bg-red-500/5 px-3 py-2">
          ! {error}
        </p>
      ) : null}

      {stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="TOTAL VISITS" value={stats.totalVisits} />
            <StatCard label="HUMAN VISITS" value={stats.humanVisits} />
            <StatCard label="TODAY" value={stats.todayVisits} />
            <StatCard label="THIS WEEK" value={stats.weekVisits} />
            <StatCard label="UNIQUE IPs" value={stats.uniqueIps} />
            <StatCard label="UNIQUE VISITORS" value={stats.uniqueVisitors} />
            <StatCard label="BOT VISITS" value={stats.totalBots} />
            <StatCard label="LOGGED ROWS" value={rows.length} />
          </div>

          {/* Breakdowns */}
          <div className="grid md:grid-cols-4 gap-3">
            <Breakdown title="TOP COUNTRIES" items={stats.topCountries} />
            <Breakdown title="TOP CITIES" items={stats.topCities} />
            <Breakdown title="VISITED PAGES" items={stats.topPaths} />
            <Breakdown title="REFERRERS" items={stats.topReferrers} />
            <Breakdown title="BROWSERS" items={stats.topBrowsers} />
            <Breakdown title="OPERATING SYSTEMS" items={stats.topOs} />
            <Breakdown title="DEVICES" items={stats.topDevices} />
            <Breakdown title="ISP / NETWORK" items={stats.topIsp} />
          </div>
        </>
      ) : null}

      {/* Log table */}
      <div className="border border-emerald-500/20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-black/60 px-4 py-3">
          <p className="text-xs text-emerald-500 uppercase tracking-widest">
            visitor_log
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter: ip / path / city / browser ..."
            className="ml-auto bg-black border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-emerald-500/50 w-full max-w-xs"
          />
        </div>

        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-950 z-10">
              <tr className="text-left text-gray-500 border-b border-emerald-500/10">
                <th className="px-4 py-2 font-normal">TIME (DHAKA)</th>
                <th className="px-4 py-2 font-normal">PATH</th>
                <th className="px-4 py-2 font-normal">IP</th>
                <th className="px-4 py-2 font-normal">GEO</th>
                <th className="px-4 py-2 font-normal">DEVICE</th>
                <th className="px-4 py-2 font-normal">ISP</th>
                <th className="px-4 py-2 font-normal">VISITOR ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const geoLink = mapsLink(row);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 hover:bg-emerald-500/5 align-top"
                  >
                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                      {formatDhakaTime(row.created_at)}
                    </td>
                    <td className="px-4 py-2 text-emerald-300">
                      {row.path ?? "-"}
                      {row.is_bot ? (
                        <span className="ml-2 text-[10px] text-amber-400 border border-amber-500/30 px-1">
                          BOT
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-gray-300">
                      {row.ip ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-gray-300">
                      {geoLink ? (
                        <a
                          href={geoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 underline decoration-emerald-500/40 hover:text-emerald-300"
                        >
                          {formatGeo(row)}
                        </a>
                      ) : row.country || row.city ? (
                        formatGeo(row)
                      ) : (
                        "-"
                      )}
                      {row.timezone ? (
                        <span className="block text-[10px] text-gray-600">
                          tz: {row.timezone}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                      {row.browser}
                      {row.os ? ` · ${row.os}` : ""}
                      {row.device ? ` · ${row.device}` : ""}
                    </td>
                    <td className="px-4 py-2 text-gray-500 max-w-[160px] truncate">
                      {row.isp ?? row.org ?? "-"}
                      {row.proxy_host ? (
                        <span className="block text-[10px] text-red-400">
                          proxy detected
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-[140px] truncate">
                      {row.visitor_id ?? "-"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                    No matching visitor rows{loading ? " (loading...)" : ""}.
                    Open the public site in a new tab and press refresh once
                    Supabase is configured.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-emerald-500/20 rounded-xl bg-black/60 p-4 hover:border-emerald-500/40 transition-colors">
      <p className="text-[10px] text-gray-500 tracking-[2px] uppercase">{label}</p>
      <p className="text-2xl text-emerald-400 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function Breakdown({ title, items }: { title: string; items: Tally[] }) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  return (
    <div className="border border-emerald-500/15 rounded-xl bg-black/40 p-4">
      <p className="text-[10px] text-emerald-500/80 tracking-[2px] uppercase mb-3">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-gray-600 text-xs">no data yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="text-xs">
              <div className="flex justify-between gap-2 text-gray-300">
                <span className="truncate">{item.key}</span>
                <span className="text-emerald-400">{item.value}</span>
              </div>
              <div className="h-1 bg-emerald-950 mt-1">
                <div
                  className="h-full bg-emerald-500/70"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
