"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VisitorRecord } from "@/src/lib/db";
import { Project } from "@/src/data/projects";
import {
  HiOutlineShieldCheck,
  HiOutlineGlobeAlt,
  HiOutlineUsers,
  HiOutlineServer,
  HiOutlineLockClosed,
  HiOutlineRefresh,
  HiOutlineLogout,
  HiOutlineArrowLeft,
  HiOutlineFolder,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineExternalLink,
} from "react-icons/hi";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"visitors" | "projects">("visitors");

  // Visitor Data
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueIps, setUniqueIps] = useState(0);
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});
  const [searchFilter, setSearchFilter] = useState("");

  // Projects Data & Management
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [projectSuccess, setProjectSuccess] = useState("");
  const [projectError, setProjectError] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    github: "",
    image: "/branch-office-network.png",
    tech: "",
    features: "",
    challenges: "",
    improvements: "",
    comingSoon: false,
  });

  // Check saved session on mount
  useEffect(() => {
    const token = localStorage.getItem("siam_admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchAdminData(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("siam_admin_token", data.token);
        setIsAuthenticated(true);
        fetchAdminData(data.token);
      } else {
        setLoginError(data.message || "Invalid authentication credentials");
      }
    } catch {
      setLoginError("Failed to connect to authentication service");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("siam_admin_token");
    setIsAuthenticated(false);
    setPassword("");
  };

  const fetchAdminData = async (token?: string) => {
    const authToken = token || localStorage.getItem("siam_admin_token");
    if (!authToken) return;

    setLoading(true);
    try {
      // 1. Fetch Visitors
      const visRes = await fetch("/api/admin/visitors?limit=250", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const visData = await visRes.json();
      if (visData.success) {
        setVisitors(visData.visitors || []);
        setTotalVisits(visData.totalVisitors || 0);
        setUniqueIps(visData.uniqueIps || 0);
        setCountryStats(visData.countryStats || {});
      }

      // 2. Fetch Projects
      const projRes = await fetch("/api/admin/projects");
      const projData = await projRes.json();
      if (projData.success && Array.isArray(projData.projects)) {
        setProjectList(projData.projects);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = localStorage.getItem("siam_admin_token");
    setProjectSuccess("");
    setProjectError("");
    setProjectLoading(true);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(projectForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProjectSuccess(`Project "${projectForm.title}" successfully added!`);
        setProjectForm({
          title: "",
          description: "",
          github: "",
          image: "/branch-office-network.png",
          tech: "",
          features: "",
          challenges: "",
          improvements: "",
          comingSoon: false,
        });
        fetchAdminData();
        setTimeout(() => setProjectSuccess(""), 4000);
      } else {
        setProjectError(data.message || "Failed to add project");
      }
    } catch {
      setProjectError("Error saving project to backend");
    } finally {
      setProjectLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Allow picking the same file again consecutively
    e.target.value = "";
    if (!file) return;

    const authToken = localStorage.getItem("siam_admin_token");
    setProjectError("");
    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setProjectForm((prev) => ({ ...prev, image: data.url }));
      } else {
        setProjectError(data.message || "Image upload failed");
      }
    } catch {
      setProjectError("Error uploading image to server");
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const authToken = localStorage.getItem("siam_admin_token");
    setDeletingId(id);
    setProjectSuccess("");
    setProjectError("");

    try {
      const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProjectSuccess(`Project "${title}" deleted successfully!`);
        setProjectList((prev) => prev.filter((p) => p.id !== id));
        setTimeout(() => setProjectSuccess(""), 4000);
      } else {
        setProjectError(data.message || "Failed to delete project");
      }
    } catch {
      setProjectError("Error connecting to server to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter visitors
  const filteredVisitors = visitors.filter((v) => {
    const query = searchFilter.toLowerCase();
    return (
      v.ip.toLowerCase().includes(query) ||
      v.country.toLowerCase().includes(query) ||
      v.city.toLowerCase().includes(query) ||
      v.isp.toLowerCase().includes(query) ||
      v.securityStatus.toLowerCase().includes(query)
    );
  });

  // If not authenticated, render login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative z-10 font-mono">
          <div className="flex items-center gap-2 mb-6 border-b border-emerald-500/20 pb-4">
            <HiOutlineLockClosed className="w-5 h-5 text-emerald-400" />
            <h1 className="text-emerald-400 text-sm tracking-wider uppercase font-bold">
              NOC Security Gateway
            </h1>
          </div>

          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            Authorized personnel only. Enter the master security password to access the Visitor Telemetry & Projects Manager.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-emerald-500/80 mb-2">
                Security Key / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full bg-black/80 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-400 text-xs font-mono">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg text-emerald-300 font-bold text-xs uppercase tracking-widest transition-all"
            >
              {loading ? "Verifying..." : "Authenticate"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-emerald-400 text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-400">
              NOC COMMAND CENTER // ADMIN
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time Visitor Audit, Telemetry Ingestion, and Projects Manager
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 border border-emerald-500/30 rounded-lg text-xs text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all flex items-center gap-2"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> Live Site
          </Link>
          <button
            onClick={() => fetchAdminData()}
            className="px-3.5 py-2 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-400 hover:bg-red-900/40 transition-all flex items-center gap-1.5"
          >
            <HiOutlineLogout className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 border ${
              activeTab === "visitors"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            <HiOutlineShieldCheck className="w-4 h-4" /> Visitor Telemetry ({uniqueIps})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 border ${
              activeTab === "projects"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            <HiOutlineFolder className="w-4 h-4" /> Projects Manager ({projectList.length})
          </button>
        </div>

        {/* Tab 1: Visitors Telemetry */}
        {activeTab === "visitors" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-950/80 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs uppercase">Total Hits</span>
                  <HiOutlineServer className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-300">{totalVisits}</div>
              </div>

              <div className="bg-zinc-950/80 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs uppercase">Unique IPs</span>
                  <HiOutlineUsers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-300">{uniqueIps}</div>
              </div>

              <div className="bg-zinc-950/80 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs uppercase">Countries</span>
                  <HiOutlineGlobeAlt className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-300">
                  {Object.keys(countryStats).length}
                </div>
              </div>

              <div className="bg-zinc-950/80 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs uppercase">Security Integrity</span>
                  <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-1">100% OPERATIONAL</div>
              </div>
            </div>

            {/* Filter Input */}
            <div className="flex items-center justify-between gap-4 bg-zinc-950/60 p-4 border border-zinc-800 rounded-xl">
              <input
                type="text"
                placeholder="Search by IP, Country, City, ISP, or Status..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Showing {filteredVisitors.length} of {visitors.length}
              </span>
            </div>

            {/* Visitor Table */}
            <div className="bg-zinc-950/80 border border-emerald-500/20 rounded-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-500/20 bg-black/80 text-emerald-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Visitor IP</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">ISP / ASN</th>
                      <th className="py-3 px-4">Protocol</th>
                      <th className="py-3 px-4">Device / OS</th>
                      <th className="py-3 px-4">Hits</th>
                      <th className="py-3 px-4">Security Status</th>
                      <th className="py-3 px-4">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          {loading ? "Ingesting telemetry logs..." : "No visitor records matched search criteria"}
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors.map((v, i) => (
                        <tr key={i} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-emerald-300">
                            {v.ip}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300">
                            {v.city ? `${v.city}, ` : ""}{v.country} ({v.countryCode})
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 max-w-[200px] truncate" title={`${v.isp} - ${v.asn}`}>
                            {v.isp}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400">
                            {v.protocol}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400">
                            {v.os} • {v.browser}
                          </td>
                          <td className="py-3.5 px-4 text-emerald-400 font-bold">
                            {v.visitCount}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                v.securityStatus === "CLEAN"
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : v.securityStatus === "INTERNAL"
                                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              }`}
                            >
                              {v.securityStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                            {new Date(v.lastVisited).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects Management */}
        {activeTab === "projects" && (
          <div className="space-y-8">
            {projectSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs">
                {projectSuccess}
              </div>
            )}

            {projectError && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-300 text-xs">
                {projectError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form: Add New Project */}
              <div className="lg:col-span-5 bg-zinc-950/80 border border-emerald-500/20 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <HiOutlinePlus className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-emerald-400">
                    Deploy New Project / Lab
                  </h2>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise pfSense DMZ & Snort IDS"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full bg-black/70 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                      <HiOutlineExternalLink className="w-4 h-4" /> GitHub Repository Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/osama95uh/my-repo"
                      value={projectForm.github}
                      onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                      className="w-full bg-black/70 border border-emerald-500/40 rounded-lg px-4 py-2.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 placeholder:text-gray-600"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Direct GitHub link for source code redirection on project card and details page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Project Image *
                    </label>
                    {/* Live preview */}
                    <div className="relative w-full h-36 mb-2 overflow-hidden rounded-lg border border-emerald-500/30 bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={projectForm.image || "/branch-office-network.png"}
                        alt="Project preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/branch-office-network.png";
                        }}
                      />
                      {imageUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-emerald-300 text-xs">
                          Uploading image...
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <label
                        className={`flex-1 text-center px-4 py-2.5 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer ${
                          imageUploading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {imageUploading ? "Uploading..." : "+ Add Project Image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="...or paste image URL"
                      value={projectForm.image}
                      onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                      className="mt-2 w-full bg-black/70 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                    />
                    <p className="text-[10px] text-gray-600 mt-1">
                      Upload PNG / JPG / WebP / GIF / SVG (max 5MB) or paste any image URL. Default: /branch-office-network.png
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Project Description *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Engineered high-availability dual-WAN failover with Snort inline IPS, dedicated VLAN segmentation..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full bg-black/70 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Technologies & Tools (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="pfSense, Suricata, WireGuard, Docker, Wazuh, Bash"
                      value={projectForm.tech}
                      onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                      className="w-full bg-black/70 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Key Features (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Hardware isolated DMZ for public facing services&#10;Dynamic GeoIP IP blocklist with automated ban rules&#10;Encrypted WireGuard site-to-site tunnel"
                      value={projectForm.features}
                      onChange={(e) => setProjectForm({ ...projectForm, features: e.target.value })}
                      className="w-full bg-black/70 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="comingSoon"
                      checked={projectForm.comingSoon}
                      onChange={(e) => setProjectForm({ ...projectForm, comingSoon: e.target.checked })}
                      className="rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-black cursor-pointer"
                    />
                    <label htmlFor="comingSoon" className="text-xs text-gray-400 cursor-pointer">
                      Mark as &quot;Coming Soon&quot; / WIP
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={projectLoading}
                    className="w-full py-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg text-emerald-300 font-bold text-xs uppercase tracking-widest transition-all mt-2 disabled:opacity-50"
                  >
                    {projectLoading ? "Deploying..." : "+ Add Project To Portfolio"}
                  </button>
                </form>
              </div>

              {/* List: Existing Projects */}
              <div className="lg:col-span-7 bg-zinc-950/80 border border-emerald-500/20 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <HiOutlineFolder className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-emerald-400">
                      Portfolio Projects Archive ({projectList.length})
                    </h2>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    Live changes reflect immediately on homepage
                  </span>
                </div>

                {projectList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                    No projects found in database. Add your first project above.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectList.map((project, idx) => (
                      <div
                        key={project.id || idx}
                        className="p-4 bg-black/60 border border-zinc-800 hover:border-emerald-500/30 rounded-xl transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-bold text-sm text-gray-200">
                                {project.title}
                              </h3>
                              {project.comingSoon ? (
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                                  Coming Soon
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                                  Live / Active
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                              {project.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {project.tech?.map((t, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-900 text-[11px]">
                              {project.github ? (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                  <HiOutlineExternalLink className="w-3.5 h-3.5" />
                                  GitHub Repo
                                </a>
                              ) : (
                                <span className="text-gray-600">No GitHub linked</span>
                              )}

                              <Link
                                href={`/projects/${project.id}`}
                                target="_blank"
                                className="text-gray-400 hover:text-white flex items-center gap-1"
                              >
                                View Page &rarr;
                              </Link>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            disabled={deletingId === project.id}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 shrink-0"
                            title="Delete Project"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
