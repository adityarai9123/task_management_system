"use client";

import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Priority = "No Priority" | "Low" | "Medium" | "High" | "Urgent";

type Project = {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  lead: string;
  dueDate: string;
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "task-management",
    name: "Task Management",
    description: "Plan, organize and track tasks across the workspace.",
    priority: "High",
    lead: "Guest User",
    dueDate: "2026-08-31",
  },
];

const priorities: Array<Priority | "All"> = ["All", "No Priority", "Urgent", "High", "Medium", "Low"];

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function priorityClass(priority: Priority) {
  if (priority === "Urgent") return "text-red-500";
  if (priority === "High") return "text-orange-500";
  if (priority === "Medium") return "text-amber-500";
  if (priority === "Low") return "text-blue-500";
  return "text-neutral-500";
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [query, setQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("No Priority");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("workspace-projects");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProjects(
          parsed.map((project: Partial<Project>) => ({
            ...project,
            priority: project.priority || "No Priority",
            lead: project.lead || "Guest User",
            dueDate: project.dueDate || "",
          })),
        );
      }
    } catch {
      setProjects(DEFAULT_PROJECTS);
    }
  }, []);

  const saveProjects = (next: Project[]) => {
    setProjects(next);
    localStorage.setItem("workspace-projects", JSON.stringify(next));
  };

  const createProject = () => {
    if (!name.trim()) return;
    saveProjects([
      ...projects,
      {
        id: `${Date.now()}`,
        name: name.trim(),
        description: description.trim() || "Workspace project.",
        priority,
        lead: "Guest User",
        dueDate,
      },
    ]);
    setName("");
    setDescription("");
    setPriority("No Priority");
    setDueDate("");
    setShowModal(false);
  };

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery = !normalized || `${project.name} ${project.description} ${project.lead}`.toLowerCase().includes(normalized);
      const matchesPriority = filterPriority === "All" || project.priority === filterPriority;
      return matchesQuery && matchesPriority;
    });
  }, [projects, query, filterPriority]);

  return (
    <main className="min-h-screen bg-[#f8f8f8] text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
      <div className="mx-auto max-w-[1180px] px-5 py-7 md:px-8 md:py-9">
        <button onClick={() => router.push("/tasks")} className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          <ArrowLeft size={16} /> Back to tasks
        </button>

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Organize work into focused project spaces.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 self-start rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"><Plus size={17} /> New Project</button>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-900">
              <Search size={15} className="text-neutral-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="w-full bg-transparent px-2 py-2.5 text-xs outline-none sm:w-48" />
            </div>
            <button onClick={() => setShowFilter((value) => !value)} className={`rounded-xl border p-2.5 ${filterPriority !== "All" ? "border-neutral-900 dark:border-white" : "border-neutral-200 dark:border-neutral-700"}`} aria-label="Filter projects"><SlidersHorizontal size={16} /></button>
            {showFilter && <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"><p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Priority</p>{priorities.map((item) => <button key={item} onClick={() => { setFilterPriority(item); setShowFilter(false); }} className={`w-full rounded-lg px-2 py-2 text-left text-xs ${filterPriority === item ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>{item}</button>)}</div>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-[minmax(260px,1.7fr)_130px_180px_150px_60px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
            <span>Projects</span><span>Priority</span><span>Lead</span><span>Due Date</span><span className="text-right">Actions</span>
          </div>
          {filteredProjects.map((project) => (
            <div key={project.id} className="grid grid-cols-[minmax(260px,1.7fr)_130px_180px_150px_60px] items-center gap-4 border-b border-neutral-200 px-5 py-4 last:border-b-0 dark:border-neutral-800">
              <button onClick={() => router.push(`/projects/${project.id}`)} className="flex min-w-0 items-center gap-3 text-left">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800"><FolderKanban size={15} /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-medium hover:underline">{project.name}</span><span className="mt-0.5 block truncate text-[11px] text-neutral-400">{project.description}</span></span>
              </button>
              <span className={`text-xs font-medium ${priorityClass(project.priority)}`}>{project.priority}</span>
              <span className="flex items-center gap-2 text-xs text-neutral-500"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">GU</span>{project.lead}</span>
              <span className="flex items-center gap-1.5 text-xs text-neutral-500"><CalendarDays size={13} />{formatDate(project.dueDate)}</span>
              <div className="flex justify-end"><button onClick={() => saveProjects(projects.filter((item) => item.id !== project.id))} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" aria-label={`Delete ${project.name}`}><MoreHorizontal size={17} /></button></div>
            </div>
          ))}
          {!filteredProjects.length && <div className="px-5 py-12 text-center text-xs text-neutral-400">No matching projects</div>}
          <button onClick={() => setShowModal(true)} className="flex w-full items-center gap-2 px-5 py-4 text-xs text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950"><Plus size={14} /> Add Projects</button>
        </div>
      </div>

      {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setShowModal(false)}>
        <div className="w-full max-w-[500px] rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800"><div><h2 className="font-semibold">New Project</h2><p className="mt-1 text-xs text-neutral-500">Create a project for this workspace.</p></div><button onClick={() => setShowModal(false)}><X size={18} /></button></div>
          <div className="space-y-4 p-6">
            <label className="block text-sm font-medium">Project name *<input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950" placeholder="e.g. Website Redesign" /></label>
            <label className="block text-sm font-medium">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Priority<select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950">{priorities.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-sm font-medium">Due date<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" /></label></div>
            <div className="flex justify-end gap-2 border-t border-neutral-200 pt-5 dark:border-neutral-800"><button onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">Cancel</button><button onClick={createProject} disabled={!name.trim()} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">Create Project</button></div>
          </div>
        </div>
      </div>}
    </main>
  );
}
