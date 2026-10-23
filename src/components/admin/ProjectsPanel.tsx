"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  emptyProjectForm,
  joinLines,
  splitLines,
  splitTech,
  type AdminProject,
  type ProjectFormState,
} from "./adminTypes";

/* ──────────────────────────────────────────────────────────────────────────
   Confirm dialog (replaces raw browser confirms so the panel stays calm)
────────────────────────────────────────────────────────────────────────── */
type Dialog = {
  title: string;
  message: string;
  confirmLabel: string
  danger?: boolean;
  onConfirm: () => void;
} | null;

function ConfirmDialog({
  dialog,
  onClose,
}: {
  dialog: Dialog;
  onClose: () => void;
}) {
  if (!dialog) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-emerald-500/30 rounded-2xl bg-zinc-950 p-6 shadow-2xl">
        <p className="text-emerald-400 text-sm mb-2">
          <span className="text-emerald-500">&gt;</span> {dialog.title}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">
          {dialog.message}
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-wider border rounded-lg border-gray-600 text-gray-400 hover:bg-white/5 transition-colors"
          >
            cancel
          </button>
          <button
            onClick={() => {
              dialog.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-lg transition-colors ${
              dialog.danger
                ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            }`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Panel
────────────────────────────────────────────────────────────────────────── */
export default function ProjectsPanel() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectFormState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? `Failed to load (${res.status}).`);
        return;
      }
      setProjects(body.projects ?? []);
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

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  };

  const openNew = () => setEditing({ ...emptyProjectForm });

  const openEdit = (p: AdminProject) =>
    setEditing({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description ?? "",
      image_url: p.image_url ?? "",
      tech: joinLines(p.tech),
      features: joinLines(p.features),
      challenges: joinLines(p.challenges),
      improvements: joinLines(p.improvements),
      github_url: p.github_url ?? "",
      live_url: p.live_url ?? "",
      coming_soon: p.coming_soon ?? false,
      sort_order: p.sort_order ?? 0,
    });

  const save = async (form: ProjectFormState): Promise<string | null> => {
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      tech: splitTech(form.tech),
      features: splitLines(form.features),
      challenges: splitLines(form.challenges),
      improvements: splitLines(form.improvements),
      github_url: form.github_url.trim(),
      live_url: form.live_url.trim(),
      coming_soon: form.coming_soon,
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
    };

    const res = await fetch(
      form.id ? `/api/admin/projects/${form.id}` : "/api/admin/projects",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return body?.error ?? `Save failed (${res.status}).`;
    flash(form.id ? "project updated ✓" : "project added ✓");
    setEditing(null);
    load();
    return null;
  };

  const remove = async (p: AdminProject) => {
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      flash(`delete failed: ${body?.error ?? res.status}`);
      return;
    }
    flash("project deleted ✓");
    load();
  };

  const toggleComingSoon = async (p: AdminProject) => {
    setToggling(p.id);
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: p.slug,
        title: p.title,
        description: p.description ?? "",
        image_url: p.image_url ?? "",
        tech: p.tech ?? [],
        features: p.features ?? [],
        challenges: p.challenges ?? [],
        improvements: p.improvements ?? [],
        github_url: p.github_url ?? "",
        live_url: p.live_url ?? "",
        coming_soon: !p.coming_soon,
        sort_order: p.sort_order ?? 0,
      }),
    });
    setToggling(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      flash(`toggle failed: ${body?.error ?? res.status}`);
      return;
    }
    flash(`coming_soon → ${!p.coming_soon} ✓`);
    load();
  };

  const askDelete = (p: AdminProject) =>
    setDialog({
      title: "delete_project",
      message: `“${p.title}” (${"\u00A0"}/projects/${p.slug}) will be removed permanently from the CMS.\nThis cannot be undone.`,
      confirmLabel: "delete",
      danger: true,
      onConfirm: () => remove(p),
    });

  const filtered = query.trim()
    ? projects.filter((p) =>
        [p.title, p.slug, p.description, (p.tech ?? []).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : projects;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-emerald-400 text-lg">
            <span className="text-emerald-500">&gt;</span> PROJECT_MANAGER
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Add / edit / delete projects. Everything here is instantly live on
            the public site.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1.5 text-xs border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 uppercase tracking-wider rounded-lg disabled:opacity-40"
          >
            {loading ? "loading..." : "refresh"}
          </button>
          <button
            onClick={openNew}
            className="px-3 py-1.5 text-xs border border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 uppercase tracking-wider rounded-lg"
          >
            + new_project
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-400 border border-red-500/30 rounded-lg bg-red-500/5 px-3 py-2">
          ! {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-xs text-emerald-300 border border-emerald-500/30 rounded-lg bg-emerald-500/5 px-3 py-2">
          {notice}
        </p>
      ) : null}

      {/* Editor */}
      {editing ? (
        <ProjectEditor
          form={editing}
          isEdit={Boolean(editing.id)}
          onCancel={() => setEditing(null)}
          onSave={save}
          onConfirm={setDialog}
        />
      ) : null}

      {/* List */}
      <div className="border border-emerald-500/20 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-emerald-500/20 bg-black/60 px-4 py-3">
          <p className="text-xs text-emerald-500 uppercase tracking-widest">
            {projects.length} project{projects.length === 1 ? "" : "s"} stored
          </p>
          {projects.length > 1 ? (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search: title / slug / tech ..."
              className="ml-auto bg-black border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-emerald-500/50 w-full max-w-xs"
            />
          ) : null}
        </div>
        {projects.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-600 text-xs">
            No projects yet — press “+ new_project”.
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-600 text-xs">
            No results for “{query}”.
          </p>
        ) : (
          <ul>
            {filtered.map((p) => (
              <li
                key={p.id}
                className="border-b border-white/5 last:border-0 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 hover:bg-white/[0.02] transition-colors"
              >
                <div className="relative w-14 h-10 border border-emerald-500/20 rounded-lg overflow-hidden shrink-0 bg-black">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 basis-40 sm:basis-0">
                  <p className="text-sm text-gray-200 truncate">
                    {p.title}
                    {p.coming_soon ? (
                      <span className="ml-2 text-[10px] text-amber-400 border border-amber-500/30 px-1 rounded align-middle">
                        COMING SOON
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-gray-600 truncate">
                    /projects/{p.slug} · {(p.tech ?? []).length} techs · order{" "}
                    {p.sort_order ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <MiniBtn
                    href={`/projects/${p.slug}`}
                    title="Open this project on the public site"
                  >
                    view ↗
                  </MiniBtn>
                  <MiniBtn
                    onClick={() => toggleComingSoon(p)}
                    title="Toggle the COMING SOON badge"
                    disabled={toggling === p.id}
                  >
                    {toggling === p.id
                      ? "..."
                      : p.coming_soon
                        ? "unset_soon"
                        : "set_soon"}
                  </MiniBtn>
                  <MiniBtn onClick={() => openEdit(p)}>edit</MiniBtn>
                  <MiniBtn
                    danger
                    onClick={() => askDelete(p)}
                    title={`Delete ${p.title}`}
                  >
                    delete
                  </MiniBtn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        dialog={dialog}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}

function MiniBtn({
  children,
  onClick,
  href,
  danger,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const cls = `px-2.5 py-1 text-[11px] uppercase tracking-wider border rounded-md transition-colors disabled:opacity-40 ${
    danger
      ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
  }`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} title={title}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Editor — full-screen modal with sections + unsaved-changes guard
────────────────────────────────────────────────────────────────────────── */
const SECTION =
  "text-[10px] text-emerald-500 uppercase tracking-[3px] font-mono pt-2";

function ProjectEditor({
  form,
  isEdit,
  onCancel,
  onSave,
  onConfirm,
}: {
  form: ProjectFormState;
  isEdit: boolean;
  onCancel: () => void;
  onSave: (form: ProjectFormState) => Promise<string | null>;
  onConfirm: (d: Dialog) => void;
}) {
  const [draft, setDraft] = useState<ProjectFormState>(form);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const dirty =
    JSON.stringify(draft) !== JSON.stringify(form) && !busy && !uploading;

  // Browser-level guard: warn before closing/reloading with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const cancel = () => {
    if (dirty) {
      onConfirm({
        title: "unsaved_changes",
        message:
          "You have edits you have not saved yet.\nClose the editor and lose them?",
        confirmLabel: "discard",
        danger: true,
        onConfirm: () => onCancel(),
      });
      return;
    }
    onCancel();
  };

  const autoSlug = () =>
    set(
      "slug",
      draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    );

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? `Upload failed (${res.status}).`);
        return;
      }
      set("image_url", body.url as string);
    } catch {
      setError("Upload request failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    // Resolve the slug: typed > auto-generated from the title.
    let slugValue = draft.slug.trim();
    if (!slugValue) {
      slugValue = draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      set("slug", slugValue);
    }
    if (!slugValue) {
      setError("Slug could not be generated from the title.");
      return;
    }
    setBusy(true);
    setError(null);
    const err = await onSave({ ...draft, slug: slugValue });
    setBusy(false);
    if (err) setError(err);
  };

  const textarea =
    "w-full bg-black border border-emerald-500/25 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-emerald-500 outline-none transition-colors";
  const input = textarea;
  const label =
    "block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-start justify-center px-3 sm:px-4 py-6 overflow-y-auto">
      <form
        onSubmit={submit}
        className="relative w-full max-w-3xl xl:max-w-4xl border border-emerald-500/40 rounded-2xl bg-zinc-950 p-5 sm:p-6 space-y-4 shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between gap-4 sticky top-0 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 py-3 bg-zinc-950/95 backdrop-blur border-b border-white/5 z-10 rounded-t-2xl">
          <div className="min-w-0">
            <p className="text-emerald-400 text-sm">
              <span className="text-emerald-500">&gt;</span>{" "}
              {isEdit ? "edit_project" : "new_project"}
              {isEdit ? ` [${form.id?.slice(0, 8)}…]` : ""}
            </p>
            {isEdit && draft.slug ? (
              <a
                href={`/projects/${draft.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-gray-500 hover:text-emerald-400 transition-colors truncate"
              >
                /projects/{draft.slug} ↗
              </a>
            ) : (
              <p className="text-[10px] text-gray-600">
                {isEdit ? "" : "Fill title + description, then save."}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={cancel}
            className="px-2.5 py-1 text-[11px] border border-gray-600 text-gray-400 hover:bg-white/5 rounded-md uppercase shrink-0"
          >
            close ✕
          </button>
        </div>

        {error ? (
          <p className="text-xs text-red-400 border border-red-500/30 rounded-lg bg-red-500/5 px-3 py-2">
            ! {error}
          </p>
        ) : null}

        {/* ── Basic info ── */}
        <p className={SECTION}>— basic info</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={label}>title *</label>
            <input
              className={input}
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              onBlur={() => {
                if (!isEdit && !draft.slug) autoSlug();
              }}
              placeholder="Branch Office Network Implementation"
            />
          </div>
          <div>
            <label className={label}>
              slug (URL id) *{" "}
              <span className="text-gray-600 normal-case tracking-normal">
                — auto from the title, edit only if needed
              </span>
            </label>
            <input
              className={input}
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="branch-office-network"
            />
          </div>
        </div>

        <div>
          <label className={label}>description</label>
          <textarea
            className={`${textarea} h-20 resize-y`}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short description shown on the project card."
          />
        </div>

        {/* Image: URL or upload */}
        <div>
          <label className={label}>image — paste an URL or upload a file</label>
          <div className="flex gap-3">
            <div className="relative w-24 h-16 border border-emerald-500/25 rounded-lg bg-black overflow-hidden shrink-0">
              {draft.image_url ? (
                <Image
                  src={draft.image_url}
                  alt="probe"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-[10px] text-gray-600">
                  no image
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <input
                className={input}
                value={draft.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="/branch-office-network.png  or  https://.../image.jpg"
              />
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 text-[11px] border border-emerald-500/30 rounded-md text-emerald-400 hover:bg-emerald-500/10 uppercase tracking-wider disabled:opacity-40"
              >
                {uploading ? "uploading..." : "upload image (max 5MB)"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <p className={SECTION}>— content</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={label}>tech stack (comma separated)</label>
            <textarea
              className={`${textarea} h-20`}
              value={draft.tech}
              onChange={(e) => set("tech", e.target.value)}
              placeholder={"Cisco Packet Tracer, VLAN Segmentation, 802.1Q Trunking"}
            />
          </div>
          <div>
            <label className={label}>links</label>
            <input
              className={`${input} mb-2`}
              value={draft.github_url}
              onChange={(e) => set("github_url", e.target.value)}
              placeholder="GitHub repo URL (optional)"
            />
            <input
              className={input}
              value={draft.live_url}
              onChange={(e) => set("live_url", e.target.value)}
              placeholder="Live demo URL (optional)"
            />
          </div>
          <div>
            <label className={label}>key features (one per line)</label>
            <textarea
              className={`${textarea} h-28`}
              value={draft.features}
              onChange={(e) => set("features", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>challenges faced (one per line)</label>
            <textarea
              className={`${textarea} h-28`}
              value={draft.challenges}
              onChange={(e) => set("challenges", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>future improvements (one per line)</label>
            <textarea
              className={`${textarea} h-28`}
              value={draft.improvements}
              onChange={(e) => set("improvements", e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className={label}>menu order (sort_order)</label>
              <input
                type="number"
                className={input}
                value={draft.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.coming_soon}
                onChange={(e) => set("coming_soon", e.target.checked)}
                className="accent-emerald-500 w-4 h-4"
              />
              coming_soon (hides the detail link, shows the badge)
            </label>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-3 bg-zinc-950/95 backdrop-blur border-t border-white/5 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl z-10">
          <p
            className={`text-[10px] tracking-wider ${
              dirty ? "text-amber-400" : "text-gray-600"
            }`}
          >
            {dirty ? "● unsaved changes" : "no pending changes"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2 text-xs uppercase tracking-wider border border-gray-600 text-gray-400 hover:bg-white/5 rounded-lg"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 text-xs uppercase tracking-wider border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-40"
            >
              {busy ? "saving..." : isEdit ? "> save changes" : "> add project"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
