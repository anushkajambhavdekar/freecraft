export type ProjectType =
  | "poster"
  | "presentation"
  | "resume"
  | "social"
  | "thumbnail"
  | "ui"
  | "certificate"
  | "invitation";

export type Project = {
  id: string;
  name: string;
  type: ProjectType;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export const PROJECTS_KEY = "freecraft:projects:v0.7";
export const DESIGN_PREFIX = "freecraft:design:v0.7:";
export const LEGACY_PREFIXES = ["freecraft:design:v0.7:", "freecraft:design:v0.6:", "freecraft:design:v0.5:"];

export const projectTypeNames: Record<ProjectType, string> = {
  poster: "Poster",
  presentation: "Presentation",
  resume: "Resume",
  social: "Social Post",
  thumbnail: "YouTube Thumbnail",
  ui: "UI Design",
  certificate: "Certificate",
  invitation: "Invitation",
};

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

export function writeProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProject(id: string | null) {
  if (!id) return undefined;
  return readProjects().find((project) => project.id === id);
}

export function createProject(type: ProjectType, name?: string): Project {
  const now = Date.now();
  const project: Project = {
    id: createId(),
    name: name?.trim() || `Untitled ${projectTypeNames[type]}`,
    type,
    createdAt: now,
    updatedAt: now,
  };

  writeProjects([project, ...readProjects()]);
  return project;
}

export function updateProject(id: string, patch: Partial<Pick<Project, "name" | "updatedAt">>) {
  const projects = readProjects();
  const next = projects.map((project) =>
    project.id === id ? { ...project, ...patch, updatedAt: patch.updatedAt ?? Date.now() } : project,
  );
  writeProjects(next);
  return next.find((project) => project.id === id);
}

export function softDeleteProject(id: string) {
  const now = Date.now();
  const projects = readProjects().map((project) =>
    project.id === id ? { ...project, deletedAt: now, updatedAt: now } : project,
  );
  writeProjects(projects);
}

export function restoreProject(id: string) {
  const projects = readProjects().map((project) =>
    project.id === id ? { ...project, deletedAt: undefined, updatedAt: Date.now() } : project,
  );
  writeProjects(projects);
}

export function permanentlyDeleteProject(id: string) {
  const projects = readProjects().filter((project) => project.id !== id);
  writeProjects(projects);
  localStorage.removeItem(`${DESIGN_PREFIX}${id}`);
  for (const prefix of LEGACY_PREFIXES) localStorage.removeItem(`${prefix}${id}`);
}

export function duplicateProject(source: Project): Project | null {
  const sourceRaw = localStorage.getItem(`${DESIGN_PREFIX}${source.id}`);
  if (!sourceRaw) return null;

  const copy: Project = {
    id: createId(),
    name: `${source.name} copy`,
    type: source.type,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  localStorage.setItem(`${DESIGN_PREFIX}${copy.id}`, sourceRaw);
  writeProjects([copy, ...readProjects()]);
  return copy;
}

export function migrateLegacyProjects() {
  if (typeof window === "undefined") return;

  const existing = readProjects();
  const knownTypes = new Set(existing.map((project) => project.type));
  const migrated: Project[] = [];

  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean) as string[];

  for (const prefix of LEGACY_PREFIXES) {
    for (const key of keys) {
      if (!key.startsWith(prefix)) continue;

      const suffix = key.slice(prefix.length);
      const legacyType = suffix.startsWith("legacy-") ? suffix.slice("legacy-".length) : suffix;
      const type = legacyType as ProjectType;
      if (!(type in projectTypeNames) || knownTypes.has(type)) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const project = createProject(type);
      localStorage.setItem(`${DESIGN_PREFIX}${project.id}`, raw);
      migrated.push(project);
      knownTypes.add(type);
    }
  }

  if (migrated.length) writeProjects([...migrated, ...readProjects().filter((p) => !migrated.some((m) => m.id === p.id))]);
}
