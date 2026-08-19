"use client";

import { ArrowLeft, CalendarDays, ChevronDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Status = "To Do" | "Doing" | "Completed" | "On Hold" | "Backlog";
type Priority = "No Priority" | "Low" | "Medium" | "High" | "Urgent";
type Task = { id: string; title: string; status: Status; priority: Priority; assignee: string; dueDate?: string; projectId?: string };
type Project = { id: string; name: string; description: string; priority: Priority; lead: string; dueDate: string };

const statuses: Status[] = ["To Do", "Doing", "Completed", "On Hold", "Backlog"];

function formatDate(value?: string) { if (!value) return "—"; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date); }
function priorityClass(priority: Priority) { if (priority === "Urgent") return "text-red-500"; if (priority === "High") return "text-orange-500"; if (priority === "Medium") return "text-amber-500"; if (priority === "Low") return "text-blue-500"; return "text-neutral-500"; }

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("workspace-projects");
      const projects: Project[] = stored ? JSON.parse(stored) : [{ id: "task-management", name: "Task Management", description: "Plan, organize and track tasks across the workspace.", priority: "High", lead: "Guest User", dueDate: "2026-08-31" }];
      const found = projects.find((item) => item.id === params.id);
      setProject(found || null);
    } catch { setProject(null); }
  }, [params.id]);

  useEffect(() => {
    fetch(`${apiUrl}/tasks`, { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Unable to load tasks."); return response.json(); })
      .then((data) => setTasks(data.map((task: any) => ({ id: task._id, title: task.title, status: task.status, priority: task.priority, assignee: task.assignee || "Guest User", dueDate: task.dueDate || "", projectId: task.projectId }))))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : "Unable to load tasks."))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const projectTasks = useMemo(() => tasks.filter((task) => params.id === "task-management" ? !task.projectId || task.projectId === "task-management" : task.projectId === params.id).filter((task) => task.title.toLowerCase().includes(query.trim().toLowerCase())), [tasks, params.id, query]);

  if (!project && !loading) return <main className="min-h-screen bg-[#f8f8f8] p-8 dark:bg-[#171717]"><div className="mx-auto max-w-[700px] pt-20 text-center"><h1 className="text-2xl font-semibold">Project not found</h1><button onClick={() => router.push("/projects")} className="mt-5 rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900">Back to projects</button></div></main>;

  return <main className="min-h-screen bg-[#f8f8f8] text-neutral-900 dark:bg-[#171717] dark:text-neutral-100"><div className="mx-auto max-w-[1180px] px-5 py-7 md:px-8 md:py-9">
    <div className="mb-6 flex items-center gap-3 text-sm text-neutral-500"><button onClick={() => router.push("/projects")} className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"><ArrowLeft size={17} /></button><span>Projects</span><span className="text-neutral-300">›</span><span className="font-medium text-neutral-800 dark:text-neutral-200">{project?.name}</span></div>
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Project</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{project?.name}</h1><p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">{project?.description}</p></div><div className="flex gap-2"><div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-900"><Search size={15} className="text-neutral-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" className="w-36 bg-transparent px-2 py-2.5 text-xs outline-none" /></div><button onClick={() => router.push("/tasks")} className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"><Plus size={15} /> Add Task</button></div></div>
    <div className="mb-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"><p className="text-[10px] uppercase tracking-wider text-neutral-400">Priority</p><p className={`mt-2 text-sm font-medium ${priorityClass(project?.priority || "No Priority")}`}>{project?.priority}</p></div><div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"><p className="text-[10px] uppercase tracking-wider text-neutral-400">Lead</p><p className="mt-2 text-sm font-medium">{project?.lead}</p></div><div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"><p className="text-[10px] uppercase tracking-wider text-neutral-400">Due date</p><p className="mt-2 flex items-center gap-1.5 text-sm font-medium"><CalendarDays size={14} />{formatDate(project?.dueDate)}</p></div></div>
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"><div className="grid grid-cols-[minmax(250px,1.7fr)_120px_160px_140px_60px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"><span>Task</span><span>Priority</span><span>Members</span><span>Due Date</span><span /></div>{statuses.map((status) => { const group=projectTasks.filter((task)=>task.status===status); return <section key={status}><div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50/60 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950/40"><ChevronDown size={14}/><span className="text-xs font-semibold">{status}</span><span className="text-[10px] text-neutral-400">{group.length}</span></div>{group.map((task)=><div key={task.id} className="grid grid-cols-[minmax(250px,1.7fr)_120px_160px_140px_60px] items-center gap-4 border-b border-neutral-200 px-5 py-3.5 last:border-b-0 dark:border-neutral-800"><button onClick={()=>router.push(`/tasks/${task.id}`)} className="truncate text-left text-xs font-medium hover:underline">{task.title}</button><span className={`text-xs font-medium ${priorityClass(task.priority)}`}>{task.priority}</span><span className="flex items-center gap-2 truncate text-xs text-neutral-500"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">GU</span>{task.assignee}</span><span className="text-xs text-neutral-500">{formatDate(task.dueDate)}</span><button className="justify-self-end rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"><MoreHorizontal size={16}/></button></div>)}{!group.length&&<div className="border-b border-neutral-200 px-5 py-5 text-center text-[11px] text-neutral-400 dark:border-neutral-800">No tasks</div>}</section>})}{loading&&<div className="p-8 text-center text-xs text-neutral-400">Loading tasks...</div>}{error&&<div className="p-5 text-xs text-red-500">{error}</div>}</div>
  </div></main>;
}
