"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Plus,
  Presentation,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createProject,
  duplicateProject,
  migrateLegacyProjects,
  permanentlyDeleteProject,
  projectTypeNames,
  readProjects,
  restoreProject,
  softDeleteProject,
  type Project,
  type ProjectType,
} from "@/lib/projects";

const createOptions: { type: ProjectType; icon: typeof Presentation; description: string }[] = [
  { type: "poster", icon: LayoutTemplate, description: "Posters, flyers and announcements." },
  { type: "presentation", icon: Presentation, description: "Slides for class, work or ideas." },
  { type: "resume", icon: FileText, description: "Clean, professional CVs." },
  { type: "social", icon: ImageIcon, description: "Social posts and announcements." },
  { type: "thumbnail", icon: ImageIcon, description: "YouTube and video thumbnails." },
  { type: "ui", icon: LayoutTemplate, description: "Product and interface concepts." },
  { type: "certificate", icon: FileText, description: "Awards, certificates and achievements." },
  { type: "invitation", icon: LayoutTemplate, description: "Invitations for events and communities." },
];

const typeAccent: Record<ProjectType, string> = {
  poster: "#2563eb",
  presentation: "#7c3aed",
  resume: "#10b981",
  social: "#06b6d4",
  thumbnail: "#f59e0b",
  ui: "#ec4899",
  certificate: "#d97706",
  invitation: "#10b981",
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const refresh = () => setProjects(readProjects());

  useEffect(() => {
    migrateLegacyProjects();
    refresh();
  }, []);

  const activeProjects = useMemo(
    () => projects
      .filter((project) => !project.deletedAt)
      .filter((project) => project.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const trash = useMemo(() => projects.filter((project) => project.deletedAt), [projects]);

  const createNew = (type: ProjectType) => {
    const project = createProject(type);
    setShowCreate(false);
    window.location.href = `/editor?type=${type}&design=${project.id}&new=1`;
  };

  const rename = (project: Project) => {
    const value = renameValue.trim();
    if (!value) return;
    const next = readProjects().map((item) =>
      item.id === project.id ? { ...item, name: value, updatedAt: Date.now() } : item,
    );
    localStorage.setItem("freecraft:projects:v0.7", JSON.stringify(next));
    setRenameId(null);
    setRenameValue("");
    refresh();
  };

  const duplicate = (project: Project) => {
    duplicateProject(project);
    setMenuId(null);
    refresh();
  };

  const trashProject = (project: Project) => {
    softDeleteProject(project.id);
    setMenuId(null);
    refresh();
  };

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b14]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
              <ArrowLeft size={18} />
            </Link>
            <Image src="/brand/freecraft-logo.png" alt="FreeCraft" width={34} height={34} className="rounded-lg object-cover" />
            <div className="hidden sm:block">
              <div className="text-sm font-bold">FreeCraft</div>
              <div className="text-[10px] text-slate-500">My designs</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/templates" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 sm:block">
              Templates
            </Link>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold hover:bg-blue-500">
              <Plus size={15} /> New design
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">Workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">My designs</h1>
            <p className="mt-3 text-sm text-slate-500">Everything you create stays on this device for now.</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 md:w-72">
            <Search size={16} className="text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search designs..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600"
            />
            {search && <button onClick={() => setSearch("")} className="text-slate-500 hover:text-white"><X size={14} /></button>}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400">{activeProjects.length} design{activeProjects.length === 1 ? "" : "s"}</div>
          <button onClick={() => setShowTrash((value) => !value)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${showTrash ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>
            <Trash2 size={14} /> Trash {trash.length ? `(${trash.length})` : ""}
          </button>
        </div>

        {showTrash ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-semibold">Trash</h2><p className="mt-1 text-xs text-slate-500">Restore designs or permanently remove them.</p></div>
              <button onClick={() => setShowTrash(false)} className="text-slate-500 hover:text-white"><X size={17} /></button>
            </div>
            {trash.length === 0 ? <p className="py-8 text-center text-sm text-slate-600">Trash is empty.</p> : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trash.map((project) => (
                  <div key={project.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-3">
                    <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-300">{project.name}</div><div className="text-[11px] text-slate-600">{projectTypeNames[project.type]}</div></div>
                    <div className="ml-3 flex gap-1">
                      <button onClick={() => { restoreProject(project.id); refresh(); }} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white" title="Restore"><RotateCcw size={14} /></button>
                      <button onClick={() => { permanentlyDeleteProject(project.id); refresh(); }} className="rounded-lg p-2 text-red-400/70 hover:bg-red-500/10 hover:text-red-300" title="Delete permanently"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {!showTrash && (
          activeProjects.length ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeProjects.map((project) => {
                const accent = typeAccent[project.type];
                const isRenaming = renameId === project.id;
                return (
                  <article key={project.id} className="group relative rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]">
                    <Link href={`/editor?type=${project.type}&design=${project.id}`} className="block">
                      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${accent}18, #111827 70%)` }}>
                        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full blur-2xl" style={{ background: `${accent}22` }} />
                        <div className="relative w-[78%] rounded-xl border border-white/10 bg-white/[0.05] p-4 shadow-2xl">
                          <div className="h-1.5 w-14 rounded-full" style={{ background: accent }} />
                          <div className="mt-4 h-2 w-[72%] rounded-full bg-white/20" />
                          <div className="mt-2 h-2 w-[54%] rounded-full bg-white/10" />
                          <div className="mt-6 flex gap-2"><div className="h-7 flex-1 rounded-lg bg-white/5" /><div className="h-7 w-10 rounded-lg" style={{ background: `${accent}55` }} /></div>
                        </div>
                        <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-white/70 backdrop-blur">{projectTypeNames[project.type]}</span>
                      </div>
                    </Link>
                    <div className="p-4">
                      {isRenaming ? (
                        <div className="flex gap-2">
                          <input autoFocus value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") rename(project); if (event.key === "Escape") setRenameId(null); }} className="min-w-0 flex-1 rounded-lg border border-blue-500/50 bg-[#111827] px-2.5 py-2 text-xs outline-none" />
                          <button onClick={() => rename(project)} className="rounded-lg bg-blue-600 px-2.5 text-xs font-bold">Save</button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/editor?type=${project.type}&design=${project.id}`} className="min-w-0">
                            <h3 className="truncate text-sm font-bold group-hover:text-blue-300">{project.name}</h3>
                            <p className="mt-1 text-[11px] text-slate-600">Updated {new Date(project.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                          </Link>
                          <div className="relative">
                            <button onClick={() => setMenuId(menuId === project.id ? null : project.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><MoreHorizontal size={16} /></button>
                            {menuId === project.id && (
                              <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-white/10 bg-[#111827] p-1.5 shadow-2xl">
                                <button onClick={() => { setRenameId(project.id); setRenameValue(project.name); setMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-white/5"><Pencil size={13} /> Rename</button>
                                <button onClick={() => duplicate(project)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-white/5"><Copy size={13} /> Duplicate</button>
                                <button onClick={() => trashProject(project)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-300 hover:bg-red-500/10"><Trash2 size={13} /> Move to trash</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400"><Plus size={24} /></div>
              <h2 className="mt-5 text-xl font-bold">Create your first design</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Start blank or choose a template. Your projects are saved locally until cloud accounts arrive.</p>
              <button onClick={() => setShowCreate(true)} className="mt-6 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold hover:bg-blue-500">Create design</button>
            </div>
          )
        )}
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f1422] p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Create a new design</h2><p className="mt-1 text-sm text-slate-500">Choose the format. You can change the canvas later.</p></div><button onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X size={17} /></button></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {createOptions.map(({ type, icon: Icon, description }) => (
                <button key={type} onClick={() => createNew(type)} className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left hover:border-blue-400/30 hover:bg-blue-500/5">
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400"><Icon size={19} /></div>
                  <div><div className="text-sm font-bold group-hover:text-blue-300">{projectTypeNames[type]}</div><div className="mt-1 text-xs leading-5 text-slate-500">{description}</div></div>
                </button>
              ))}
            </div>
            <Link href="/templates" onClick={() => setShowCreate(false)} className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10"><LayoutTemplate size={15} /> Start from a template instead</Link>
          </div>
        </div>
      )}
    </main>
  );
}
