"use client";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  FileText,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeToggle from "../../components/themeToggle";

type Status = "To Do" | "Doing" | "Completed" | "On Hold" | "Backlog";
type Priority = "No Priority" | "Low" | "Medium" | "High" | "Urgent";

type Subtask = {
  _id?: string;
  id?: string;
  title: string;
  priority: Priority;
  assignee: string;
  dueDate?: string;
  completed: boolean;
};

type Comment = {
  _id?: string;
  id?: string;
  text: string;
  author: string;
  parentId?: string;
  createdAt?: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  labels: string[];
  teams: string[];
  resources: string[];
  assignee: string;
  reporter: string;
  subtasks: Subtask[];
  comments: Comment[];
};

const statuses: Status[] = ["To Do", "Doing", "Completed", "On Hold", "Backlog"];
const priorities: Priority[] = ["No Priority", "Low", "Medium", "High", "Urgent"];

function normalizeTask(raw: any): Task {
  return {
    id: raw._id,
    title: raw.title || "Untitled task",
    description: raw.description || "",
    status: raw.status || "To Do",
    priority: raw.priority || "No Priority",
    dueDate: raw.dueDate || "",
    labels: raw.labels || [],
    teams: raw.teams || [],
    resources: raw.resources || [],
    assignee: raw.assignee || "Guest User",
    reporter: raw.reporter || "Guest User",
    subtasks: (raw.subtasks || []).map((item: any) => ({
      ...item,
      id: item._id || item.id,
      priority: item.priority || "No Priority",
      assignee: item.assignee || "Guest User",
      completed: Boolean(item.completed),
    })),
    comments: (raw.comments || []).map((item: any) => ({
      ...item,
      id: item._id || item.id,
      author: item.author || "Guest User",
    })),
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function priorityClass(priority: Priority) {
  switch (priority) {
    case "Urgent":
      return "text-red-500";
    case "High":
      return "text-orange-500";
    case "Medium":
      return "text-amber-500";
    case "Low":
      return "text-blue-500";
    default:
      return "text-neutral-500";
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TaskDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const taskId = params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showResources, setShowResources] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [resourceInput, setResourceInput] = useState("");

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Task not found.");
      setTask(normalizeTask(await response.json()));
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load this task. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, taskId]);

  useEffect(() => {
    if (taskId) loadTask();
  }, [loadTask, taskId]);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-detail-popover]")) {
        setShowPriorityMenu(false);
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const savePatch = async (patch: Record<string, unknown>) => {
    if (!task) return false;
    try {
      setSaving(true);
      setError("");
      const response = await fetch(`${apiUrl}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message?.join?.(" ") || body?.message || "Unable to update task.");
      }
      setTask(normalizeTask(await response.json()));
      return true;
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Unable to update task.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const rootComments = useMemo(
    () => task?.comments.filter((comment) => !comment.parentId) || [],
    [task],
  );

  const repliesFor = (commentId?: string) =>
    task?.comments.filter((comment) => comment.parentId === commentId) || [];

  const addSubtask = async () => {
    if (!task || !newSubtask.trim()) return;
    const next = [
      ...task.subtasks,
      {
        id: uid("subtask"),
        title: newSubtask.trim(),
        priority: "No Priority" as Priority,
        assignee: "Guest User",
        dueDate: "",
        completed: false,
      },
    ];
    if (await savePatch({ subtasks: next })) setNewSubtask("");
  };

  const toggleSubtask = async (subtask: Subtask) => {
    if (!task) return;
    const next = task.subtasks.map((item) =>
      (item.id || item._id) === (subtask.id || subtask._id)
        ? { ...item, completed: !item.completed }
        : item,
    );
    await savePatch({ subtasks: next });
  };

  const addComment = async (text: string, parentId?: string) => {
    if (!task || !text.trim()) return;
    const next = [
      ...task.comments,
      {
        id: uid("comment"),
        text: text.trim(),
        author: "Guest User",
        parentId,
        createdAt: new Date().toISOString(),
      },
    ];
    if (await savePatch({ comments: next })) {
      if (parentId) {
        setReplyTo(null);
        setReplyText("");
      } else {
        setNewComment("");
      }
    }
  };

  const addResource = async () => {
    if (!task || !resourceInput.trim()) return;
    const next = [...task.resources, resourceInput.trim()];
    if (await savePatch({ resources: next })) setResourceInput("");
  };

  const completedSubtasks = task?.subtasks.filter((item) => item.completed).length || 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] p-6 text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
        <div className="mx-auto max-w-[1180px] animate-pulse space-y-5">
          <div className="h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-12 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-72 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] p-6 text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
        <div className="mx-auto max-w-[760px] pt-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Task</p>
          <h1 className="mt-2 text-2xl font-semibold">Task unavailable</h1>
          <p className="mt-2 text-sm text-neutral-500">{error || "The requested task could not be found."}</p>
          <button onClick={() => router.push("/tasks")} className="mt-6 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
            Back to tasks
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-[#1f1f1f]/95">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3 text-sm text-neutral-500">
            <button onClick={() => router.push("/tasks")} className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Back to tasks">
              <ArrowLeft size={18} />
            </button>
            <span className="hidden sm:inline">Tasks</span>
            <span className="hidden text-neutral-300 sm:inline">/</span>
            <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">{task.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => router.push("/tasks")} className="hidden rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50 sm:block dark:border-neutral-700 dark:hover:bg-neutral-800">
              Back to tasks
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 py-7 md:px-8 md:py-9">
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <span>{error}</span>
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-semibold tracking-tight md:text-3xl">{task.title}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {task.description || "Add a description to give your team more context about this task."}
                  </p>
                </div>
                <button className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="More task options">
                  <MoreHorizontal size={19} />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-neutral-400">Properties</span>
                <span className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 dark:border-neutral-700">
                  <CircleUserRound size={12} /> {task.assignee}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 dark:border-neutral-700">
                  <CalendarDays size={12} /> {formatDate(task.dueDate)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <span key={label} className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                    <Tag size={11} /> {label}
                  </span>
                ))}
                {!task.labels.length && <span className="text-xs text-neutral-400">No labels</span>}
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
                <Link2 size={13} />
                <button onClick={() => setShowResources((value) => !value)} className="hover:text-neutral-900 dark:hover:text-white">
                  {task.resources.length ? `${task.resources.length} resource${task.resources.length === 1 ? "" : "s"}` : "Add document or link..."}
                </button>
              </div>

              {showResources && (
                <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="flex gap-2">
                    <input value={resourceInput} onChange={(event) => setResourceInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addResource()} placeholder="Paste a document or link" className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900" />
                    <button onClick={addResource} disabled={!resourceInput.trim() || saving} className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900">Add</button>
                  </div>
                  {task.resources.length > 0 && <div className="mt-3 space-y-1.5">{task.resources.map((resource) => <p key={resource} className="truncate text-xs text-neutral-500">{resource}</p>)}</div>}
                </div>
              )}
            </div>

            <section className="mt-5 rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <ChevronDown size={15} />
                  <h2 className="text-sm font-semibold">Subtasks</h2>
                  <span className="text-xs text-neutral-400">{completedSubtasks}/{task.subtasks.length}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[650px]">
                  <div className="grid grid-cols-[minmax(240px,1.6fr)_110px_150px_120px_55px] gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                    <span>Task</span><span>Priority</span><span>Members</span><span>Due Date</span><span />
                  </div>
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id || subtask._id} className="grid grid-cols-[minmax(240px,1.6fr)_110px_150px_120px_55px] items-center gap-3 border-b border-neutral-200 px-5 py-3.5 last:border-b-0 dark:border-neutral-800">
                      <button onClick={() => toggleSubtask(subtask)} className="flex min-w-0 items-center gap-2 text-left">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${subtask.completed ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-300 dark:border-neutral-600"}`}>
                          {subtask.completed && <Check size={12} />}
                        </span>
                        <span className={`truncate text-xs font-medium ${subtask.completed ? "text-neutral-400 line-through" : ""}`}>{subtask.title}</span>
                      </button>
                      <span className={`text-xs font-medium ${priorityClass(subtask.priority)}`}>{subtask.priority}</span>
                      <span className="flex items-center gap-2 truncate text-xs text-neutral-500"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[8px] font-bold text-white">GU</span>{subtask.assignee}</span>
                      <span className="text-xs text-neutral-500">{formatDate(subtask.dueDate)}</span>
                      <button className="justify-self-end rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"><MoreHorizontal size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
                <div className="flex gap-2">
                  <input value={newSubtask} onChange={(event) => setNewSubtask(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addSubtask()} placeholder="Add Subtask" className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-xs outline-none placeholder:text-neutral-400 focus:bg-neutral-50 dark:focus:bg-neutral-950" />
                  <button onClick={addSubtask} disabled={!newSubtask.trim() || saving} className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800"><Plus size={14} /> Add</button>
                </div>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-4 flex items-center gap-2"><MessageCircle size={16} /><h2 className="text-sm font-semibold">Updates</h2></div>
              <div className="space-y-4">
                {rootComments.map((comment) => (
                  <div key={comment.id || comment._id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">GU</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold">{comment.author}</span><span className="text-[10px] text-neutral-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "just now"}</span></div>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-neutral-600 dark:text-neutral-300">{comment.text}</p>
                        <button onClick={() => setReplyTo((value) => value === (comment.id || comment._id) ? null : (comment.id || comment._id) || null)} className="mt-3 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Reply</button>
                        {repliesFor(comment.id || comment._id).map((reply) => <div key={reply.id || reply._id} className="mt-3 border-l-2 border-neutral-200 pl-3 dark:border-neutral-700"><span className="text-[11px] font-semibold">{reply.author}</span><p className="mt-1 text-xs leading-5 text-neutral-500">{reply.text}</p></div>)}
                        {replyTo === (comment.id || comment._id) && <div className="mt-3 flex gap-2"><input autoFocus value={replyText} onChange={(event) => setReplyText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addComment(replyText, comment.id || comment._id)} placeholder="Leave a reply..." className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900" /><button onClick={() => addComment(replyText, comment.id || comment._id)} disabled={!replyText.trim() || saving} className="rounded-lg bg-neutral-900 px-3 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"><Send size={13} /></button></div>}
                      </div>
                    </div>
                  </div>
                ))}
                {!rootComments.length && <p className="py-3 text-xs text-neutral-400">No updates yet.</p>}
                <div className="flex gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">GU</div>
                  <input value={newComment} onChange={(event) => setNewComment(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addComment(newComment)} placeholder="Add a comment..." className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-950" />
                  <button onClick={() => addComment(newComment)} disabled={!newComment.trim() || saving} className="rounded-lg bg-neutral-900 px-3 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"><Send size={13} /></button>
                </div>
              </div>
            </section>
          </section>

          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <button onClick={() => setShowDetails((value) => !value)} className="flex w-full items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <span className="text-sm font-semibold">Details</span><ChevronDown size={15} className={showDetails ? "" : "-rotate-90"} />
            </button>
            {showDetails && (
              <div className="space-y-5 p-5">
                <div data-detail-popover className="relative">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Status</p>
                  <button onClick={() => setShowStatusMenu((value) => !value)} className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-xs dark:border-neutral-700"><span>{task.status}</span><ChevronDown size={13} /></button>
                  {showStatusMenu && <div data-detail-popover className="absolute left-0 right-0 top-[54px] z-40 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">{statuses.map((status) => <button key={status} disabled={status === task.status} onClick={() => { savePatch({ status }); setShowStatusMenu(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs ${status === task.status ? "text-neutral-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>{status}</button>)}</div>}
                </div>

                <div data-detail-popover className="relative">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Priority</p>
                  <button onClick={() => setShowPriorityMenu((value) => !value)} className={`flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-xs dark:border-neutral-700 ${priorityClass(task.priority)}`}><span>{task.priority}</span><ChevronDown size={13} /></button>
                  {showPriorityMenu && <div data-detail-popover className="absolute left-0 right-0 top-[54px] z-40 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">{priorities.map((priority) => <button key={priority} disabled={priority === task.priority} onClick={() => { savePatch({ priority }); setShowPriorityMenu(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs ${priority === task.priority ? "text-neutral-400" : `${priorityClass(priority)} hover:bg-neutral-100 dark:hover:bg-neutral-800`}`}>{priority}</button>)}</div>}
                </div>

                <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Members</p><div className="flex items-center gap-2 text-xs"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">GU</span>{task.assignee}</div></div>
                <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Dates</p><div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300"><CalendarDays size={14} />{formatDate(task.dueDate)}</div></div>
                <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Labels</p><div className="flex flex-wrap gap-1.5">{task.labels.length ? task.labels.map((label) => <span key={label} className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] dark:bg-neutral-800">{label}</span>) : <span className="text-xs text-neutral-400">None</span>}</div></div>
                <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Teams</p><div className="flex items-center gap-2 text-xs text-neutral-500"><Users size={14} />{task.teams.length ? task.teams.join(", ") : "No team assigned"}</div></div>
                <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Reporter</p><div className="flex items-center gap-2 text-xs text-neutral-500"><FileText size={14} />{task.reporter}</div></div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
