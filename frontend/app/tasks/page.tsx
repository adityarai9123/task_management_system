"use client";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "../components/themeToggle";

type Status = "To Do" | "Doing" | "Completed" | "On Hold" | "Backlog";
type Priority = "No Priority" | "Low" | "Medium" | "High" | "Urgent";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  labels?: string[];
  assignee?: string;
  reporter?: string;
}

type Column = {
  id: string;
  title: Status;
  tasks: Task[];
};

const STATUSES: Status[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
  "Backlog",
];
const PRIORITIES: Priority[] = [
  "No Priority",
  "Low",
  "Medium",
  "High",
  "Urgent",
];
const AVAILABLE_LABELS = ["Bug", "Feature", "Improvement", "Documentation"];

const INITIAL_COLUMNS: Column[] = STATUSES.map((title) => ({
  id: title.toLowerCase().replaceAll(" ", "-"),
  title,
  tasks: [],
}));

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "To Do" as Status,
  priority: "No Priority" as Priority,
  dueDate: "",
  labels: [] as string[],
};

const fieldLabels: Array<{
  key: keyof EMPTY_VISIBLE_FIELDS;
  label: string;
}> = [
  { key: "priority", label: "Priority" },
  { key: "members", label: "Members" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "status", label: "Status" },
  { key: "reporter", label: "Reporter" },
];

type EMPTY_VISIBLE_FIELDS = {
  priority: boolean;
  members: boolean;
  dueDate: boolean;
  labels: boolean;
  status: boolean;
  reporter: boolean;
};

const INITIAL_VISIBLE_FIELDS: EMPTY_VISIBLE_FIELDS = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

function normalizeTask(raw: any): Task {
  return {
    id: raw._id,
    title: raw.title,
    description: raw.description || "",
    status: raw.status,
    priority: raw.priority,
    dueDate: raw.dueDate || "",
    labels: raw.labels || [],
    assignee: raw.assignee || "Guest User",
    reporter: raw.reporter || "Guest User",
  };
}

function formatDueDate(value?: string) {
  if (!value) return "";
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
      return "text-red-600 dark:text-red-400";
    case "High":
      return "text-orange-600 dark:text-orange-400";
    case "Medium":
      return "text-amber-600 dark:text-amber-400";
    case "Low":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-neutral-500 dark:text-neutral-400";
  }
}

export default function TasksPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [showFields, setShowFields] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [view, setView] = useState<"board" | "list">("board");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [visibleFields, setVisibleFields] = useState<EMPTY_VISIBLE_FIELDS>(
    INITIAL_VISIBLE_FIELDS,
  );

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [openTaskMenu, setOpenTaskMenu] = useState<string | null>(null);
  const [taskMenuPosition, setTaskMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [collapsedColumns, setCollapsedColumns] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest("[data-popover]")) {
        setShowFields(false);
        setShowFilter(false);
        setShowUserMenu(false);
        setShowWorkspaceMenu(false);
        setOpenTaskMenu(null);
        setTaskMenuPosition(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setShowFields(false);
      setShowFilter(false);
      setShowUserMenu(false);
      setShowWorkspaceMenu(false);
      setOpenTaskMenu(null);
      setTaskMenuPosition(null);

      if (showTaskModal) closeTaskModal();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTaskModal]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError("");
        const response = await fetch(`${apiUrl}/tasks`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks.");
        }

        const data = await response.json();
        const tasks: Task[] = data.map(normalizeTask);

        setColumns(
          INITIAL_COLUMNS.map((column) => ({
            ...column,
            tasks: tasks.filter((task) => task.status === column.title),
          })),
        );
      } catch (fetchError) {
        console.error(fetchError);
        setError(
          "Unable to load tasks. Make sure the backend is running and NEXT_PUBLIC_API_URL is correct.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [apiUrl]);

  const allTasks = useMemo(
    () => columns.flatMap((column) => column.tasks),
    [columns],
  );

  const assignees = useMemo(() => {
    const values = Array.from(
      new Set(allTasks.map((task) => task.assignee || "Guest User")),
    );
    return values.length ? values : ["Guest User"];
  }, [allTasks]);

  const filteredColumns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        const matchesSearch =
          !query ||
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.labels?.some((label) => label.toLowerCase().includes(query));

        const matchesPriority =
          filterPriority === "All" || task.priority === filterPriority;

        const matchesAssignee =
          filterAssignee === "All" ||
          (task.assignee || "Guest User") === filterAssignee;

        return matchesSearch && matchesPriority && matchesAssignee;
      }),
    }));
  }, [columns, searchQuery, filterPriority, filterAssignee]);

  const activeFilterCount =
    Number(filterPriority !== "All") + Number(filterAssignee !== "All");

  const openAddTask = (status: Status = "To Do") => {
    setEditingTask(null);
    setForm({ ...EMPTY_FORM, status });
    setError("");
    setShowTaskModal(true);
    setShowFields(false);
    setShowFilter(false);
    setShowUserMenu(false);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || "",
      labels: task.labels || [],
    });
    setError("");
    setShowTaskModal(true);
    setOpenTaskMenu(null);
    setTaskMenuPosition(null);
  };

  function closeTaskModal() {
    if (saving) return;
    setShowTaskModal(false);
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  const saveTask = async () => {
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingTask
        ? `${apiUrl}/tasks/${editingTask.id}`
        : `${apiUrl}/tasks`;

      const response = await fetch(url, {
        method: editingTask ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          labels: form.labels,
          assignee: editingTask?.assignee || "Guest User",
          reporter: editingTask?.reporter || "Guest User",
        }),
      });

      if (!response.ok) {
        let message = "Unable to save the task.";
        try {
          const body = await response.json();
          if (Array.isArray(body.message)) message = body.message.join(" ");
          else if (body.message) message = body.message;
        } catch {}
        throw new Error(message);
      }

      const savedTask = normalizeTask(await response.json());

      setColumns((current) =>
        current.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== savedTask.id),
        })),
      );

      setColumns((current) =>
        current.map((column) =>
          column.title === savedTask.status
            ? { ...column, tasks: [...column.tasks, savedTask] }
            : column,
        ),
      );

      closeTaskModal();
    } catch (saveError: any) {
      console.error(saveError);
      setError(saveError?.message || "Unable to save the task.");
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task? This action cannot be undone."))
      return;

    try {
      setDeletingTask(taskId);
      setError("");

      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Unable to delete the task.");

      setColumns((current) =>
        current.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        })),
      );

      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
    } catch (deleteError: any) {
      console.error(deleteError);
      setError(deleteError?.message || "Unable to delete the task.");
    } finally {
      setDeletingTask(null);
    }
  };

  const changeTaskStatus = async (taskId: string, newStatus: Status) => {
    try {
      setError("");

      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Unable to update task status.");

      const updatedTask = normalizeTask(await response.json());

      setColumns((current) =>
        current.map((column) => ({
          ...column,
          tasks: column.tasks
            .filter((task) => task.id !== updatedTask.id)
            .concat(column.title === updatedTask.status ? [updatedTask] : []),
        })),
      );

      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
    } catch (statusError: any) {
      console.error(statusError);
      setError(statusError?.message || "Unable to update task status.");
    }
  };

  const clearFilters = () => {
    setFilterPriority("All");
    setFilterAssignee("All");
  };

  const toggleField = (key: keyof EMPTY_VISIBLE_FIELDS) => {
    setVisibleFields((current) => ({ ...current, [key]: !current[key] }));
  };

  const toggleLabel = (label: string) => {
    setForm((current) => ({
      ...current,
      labels: current.labels.includes(label)
        ? current.labels.filter((item) => item !== label)
        : [...current.labels, label],
    }));
  };

  const openTaskMenuAt = (
    event: React.MouseEvent<HTMLButtonElement>,
    taskId: string,
  ) => {
    event.stopPropagation();

    if (openTaskMenu === taskId) {
      setOpenTaskMenu(null);
      setTaskMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 370;
    const menuWidth = 190;
    const gap = 6;

    const top =
      window.innerHeight - rect.bottom < menuHeight
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap;

    const left = Math.min(
      window.innerWidth - menuWidth - 8,
      Math.max(8, rect.right - menuWidth),
    );

    setTaskMenuPosition({ top, left });
    setOpenTaskMenu(taskId);
  };

  const renderTaskMenu = (task: Task) => {
    if (openTaskMenu !== task.id) return null;

    return (
      <div
        data-popover
        className="fixed z-[80] w-[190px] rounded-xl border border-neutral-200 bg-white p-1.5 text-neutral-900 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        style={{
          top: taskMenuPosition?.top ?? 0,
          left: taskMenuPosition?.left ?? 0,
        }}
      >
        <button
          onClick={() => openEditTask(task)}
          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Edit task
        </button>

        <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          Move to
        </p>

        {STATUSES.map((status) => (
          <button
            key={status}
            disabled={task.status === status}
            onClick={() => changeTaskStatus(task.id, status)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              task.status === status
                ? "cursor-default text-neutral-400"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {status}
          </button>
        ))}

        <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

        <button
          onClick={() => deleteTask(task.id)}
          disabled={deletingTask === task.id}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
        >
          {deletingTask === task.id ? "Deleting..." : "Delete task"}
        </button>
      </div>
    );
  };

  const renderTaskCard = (task: Task) => (
    <article
      key={task.id}
      className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold leading-5 text-neutral-900 dark:text-neutral-100">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              {task.description}
            </p>
          )}
        </div>

        <button
          data-popover
          onClick={(event) => openTaskMenuAt(event, task.id)}
          aria-label={`Actions for ${task.title}`}
          className="shrink-0 rounded-lg p-1.5 text-neutral-400 opacity-70 transition hover:bg-neutral-100 hover:text-neutral-900 group-hover:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>

      {visibleFields.priority && (
        <div
          className={`mt-3 text-xs font-medium ${priorityClass(task.priority)}`}
        >
          Priority: {task.priority}
        </div>
      )}

      {visibleFields.status && (
        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Status: {task.status}
        </div>
      )}

      {visibleFields.labels && task.labels && task.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {(visibleFields.members ||
        visibleFields.reporter ||
        (visibleFields.dueDate && task.dueDate)) && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {visibleFields.members && (
              <>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">
                  GU
                </div>
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {task.assignee || "Guest User"}
                </span>
              </>
            )}

            {visibleFields.reporter && (
              <span className="truncate text-[11px] text-neutral-400">
                Reporter: {task.reporter || "Guest User"}
              </span>
            )}
          </div>

          {visibleFields.dueDate && task.dueDate && (
            <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-500 dark:bg-red-950/30 dark:text-red-400">
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      )}

      {renderTaskMenu(task)}
    </article>
  );

  const renderList = () => (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="hidden grid-cols-[minmax(240px,1.8fr)_120px_150px_150px_130px_70px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 md:grid">
        <span>Task</span>
        {visibleFields.priority && <span>Priority</span>}
        {visibleFields.members && <span>Members</span>}
        {visibleFields.dueDate && <span>Due Date</span>}
        {visibleFields.status && <span>Status</span>}
        <span className="text-right">Actions</span>
      </div>

      {filteredColumns.map((column) => (
        <div key={column.id}>
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/70 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950/50">
            <button
              onClick={() =>
                setCollapsedColumns((current) => ({
                  ...current,
                  [column.id]: !current[column.id],
                }))
              }
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <ChevronDown
                size={15}
                className={`transition ${
                  collapsedColumns[column.id] ? "-rotate-90" : ""
                }`}
              />
              {column.title}
              <span className="text-xs font-normal text-neutral-400">
                {column.tasks.length}
              </span>
            </button>

            <button
              onClick={() => openAddTask(column.title)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label={`Add task to ${column.title}`}
            >
              <Plus size={15} />
            </button>
          </div>

          {!collapsedColumns[column.id] &&
            column.tasks.map((task) => (
              <div
                key={task.id}
                className="grid gap-3 border-b border-neutral-200 px-5 py-4 last:border-b-0 dark:border-neutral-800 md:grid-cols-[minmax(240px,1.8fr)_120px_150px_150px_130px_70px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {task.description}
                    </p>
                  )}
                  {visibleFields.labels && task.labels?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {visibleFields.priority && (
                  <span
                    className={`text-xs font-medium ${priorityClass(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                )}

                {visibleFields.members && (
                  <span className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[9px] font-bold text-white">
                      GU
                    </span>
                    <span className="truncate">
                      {task.assignee || "Guest User"}
                    </span>
                  </span>
                )}

                {visibleFields.dueDate && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {task.dueDate ? formatDueDate(task.dueDate) : "—"}
                  </span>
                )}

                {visibleFields.status && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {task.status}
                  </span>
                )}

                <div className="flex justify-end">
                  <button
                    data-popover
                    onClick={(event) => openTaskMenuAt(event, task.id)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                    aria-label={`Actions for ${task.title}`}
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>

                {renderTaskMenu(task)}
              </div>
            ))}

          {!collapsedColumns[column.id] && column.tasks.length === 0 && (
            <div className="border-b border-neutral-200 px-5 py-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
              No matching tasks
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
      {mobileSidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white transition-[width,transform] duration-200 dark:border-neutral-800 dark:bg-[#1f1f1f] ${
          mobileSidebarOpen
            ? "w-[256px] translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } ${sidebarOpen ? "md:w-[256px]" : "md:w-[72px]"}`}
      >
        <div className="flex h-full flex-col overflow-visible">
          <div className="relative border-b border-neutral-200 p-3 dark:border-neutral-800">
            <button
              data-popover
              onClick={() => {
                setShowUserMenu((value) => !value);
                setShowWorkspaceMenu(false);
              }}
              className={`flex w-full items-center rounded-xl py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                sidebarOpen ? "gap-3 px-2" : "justify-center px-0"
              }`}
              aria-label="Open user menu"
              title={!sidebarOpen ? "Guest User" : undefined}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-xs font-bold text-white">
                GU
              </div>
              {sidebarOpen && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">Guest User</p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      guest@pyramid.com
                    </p>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-neutral-400 transition ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {showUserMenu && (
              <div
                data-popover
                className={`absolute top-[72px] z-[70] w-[250px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 ${
                  sidebarOpen ? "left-3" : "left-[68px]"
                }`}
              >
                <div className="p-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-sm font-bold text-white">
                    GU
                  </div>
                  <p className="mt-2 text-center text-sm font-semibold">
                    Guest User
                  </p>
                  <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                    guest@pyramid.com
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={`px-3 py-5 ${sidebarOpen ? "" : "px-2"}`}>
            {sidebarOpen ? (
              <button
                data-popover
                onClick={() => setShowWorkspaceMenu((value) => !value)}
                className="flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Workspace
                <ChevronDown
                  size={14}
                  className={`transition ${
                    showWorkspaceMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <div className="mb-2 h-px bg-neutral-200 dark:bg-neutral-800" />
            )}

            {showWorkspaceMenu && sidebarOpen && (
              <div
                data-popover
                className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="rounded-lg bg-white px-3 py-2 font-medium shadow-sm dark:bg-neutral-800">
                  Pyramid Workspace
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                window.location.href = "/tasks";
              }}
              className={`mt-3 flex w-full items-center rounded-xl bg-neutral-100 py-2.5 text-sm font-medium dark:bg-neutral-800 ${
                sidebarOpen ? "gap-3 px-3" : "justify-center px-0"
              }`}
              aria-label="Tasks"
              title={!sidebarOpen ? "Tasks" : undefined}
            >
              <SlidersHorizontal size={17} />
              {sidebarOpen && "Tasks"}
            </button>

            <button
              onClick={() => (window.location.href = "/projects")}
              className={`mt-1 flex w-full items-center rounded-xl py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
                sidebarOpen ? "gap-3 px-3" : "justify-center px-0"
              }`}
              aria-label="Projects"
              title={!sidebarOpen ? "Projects" : undefined}
            >
              <Folder size={17} />
              {sidebarOpen && "Projects"}
            </button>
          </div>

          <div className="mt-auto border-t border-neutral-200 p-3 dark:border-neutral-800">
            <button
              onClick={() => (window.location.href = "/settings")}
              className={`flex w-full items-center rounded-xl py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
                sidebarOpen ? "gap-3 px-3" : "justify-center px-0"
              }`}
              aria-label="Settings"
              title={!sidebarOpen ? "Settings" : undefined}
            >
              <Settings size={17} />
              {sidebarOpen && "Settings"}
            </button>
          </div>
        </div>
      </aside>

      <main
        className={`min-h-screen min-w-0 transition-[margin] duration-200 ${
          sidebarOpen ? "md:ml-[256px]" : "md:ml-[72px]"
        }`}
      >
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center border-b border-neutral-200 bg-white/95 px-4 backdrop-blur md:px-7 dark:border-neutral-800 dark:bg-[#1f1f1f]/95">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileSidebarOpen(true);
              } else {
                setSidebarOpen((value) => !value);
                setShowUserMenu(false);
                setShowWorkspaceMenu(false);
              }
            }}
            className="mr-3 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={19} />
            ) : (
              <ChevronRight size={19} />
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div data-popover className="relative flex items-center">
              {showSearch && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search tasks..."
                  className="mr-2 w-[180px] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 sm:w-56"
                />
              )}
              <button
                onClick={() => {
                  setShowSearch((value) => !value);
                  if (showSearch) setSearchQuery("");
                }}
                className="rounded-xl border border-neutral-200 bg-white p-2.5 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                aria-label="Search tasks"
              >
                <Search size={18} />
              </button>
            </div>

            <div data-popover className="relative">
              <button
                onClick={() => {
                  setShowFields((value) => !value);
                  setShowFilter(false);
                }}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
                  showFields
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Fields</span>
              </button>

              {showFields && (
                <div
                  data-popover
                  className="absolute right-0 top-12 z-[60] w-60 rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">Visible fields</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      Choose what appears in your task views.
                    </p>
                  </div>

                  {fieldLabels.map((field) => (
                    <label
                      key={field.key}
                      className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {field.label}
                      <input
                        type="checkbox"
                        checked={visibleFields[field.key]}
                        onChange={() => toggleField(field.key)}
                        className="h-4 w-4 accent-neutral-900 dark:accent-white"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div data-popover className="relative">
              <button
                onClick={() => {
                  setShowFilter((value) => !value);
                  setShowFields(false);
                }}
                className={`relative rounded-xl border p-2.5 ${
                  showFilter || activeFilterCount
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                }`}
                aria-label="Filter tasks"
              >
                <Filter size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilter && (
                <div
                  data-popover
                  className="absolute right-0 top-12 z-[60] w-[280px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">Filter tasks</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Narrow down the current view.
                      </p>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-neutral-500">
                      Priority
                    </span>
                    <select
                      value={filterPriority}
                      onChange={(event) =>
                        setFilterPriority(
                          event.target.value as Priority | "All",
                        )
                      }
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950"
                    >
                      <option value="All">All priorities</option>
                      {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-neutral-500">
                      Assignee
                    </span>
                    <select
                      value={filterAssignee}
                      onChange={(event) =>
                        setFilterAssignee(event.target.value)
                      }
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950"
                    >
                      <option value="All">All members</option>
                      {assignees.map((assignee) => (
                        <option key={assignee} value={assignee}>
                          {assignee}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="hidden items-center rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900 sm:flex">
              <button
                onClick={() => setView("list")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  view === "list"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-500"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("board")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  view === "board"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-500"
                }`}
              >
                Board
              </button>
            </div>

            <ThemeToggle />

            <button
              onClick={() => openAddTask()}
              className="flex items-center gap-2 rounded-xl bg-neutral-900 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Plus size={17} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </header>

        <section className="px-4 py-6 md:px-7 md:py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Workspace
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Tasks
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {allTasks.length} total task{allTasks.length === 1 ? "" : "s"}
                {activeFilterCount > 0 || searchQuery ? " · filtered view" : ""}
              </p>
            </div>

            {(searchQuery || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  clearFilters();
                }}
                className="flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 sm:self-auto"
              >
                <X size={14} />
                Clear search & filters
              </button>
            )}
          </div>

          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {STATUSES.map((status) => (
                <div
                  key={status}
                  className="h-56 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : view === "list" ? (
            renderList()
          ) : (
            <div className="flex min-w-0 gap-4 overflow-x-auto pb-6">
              {filteredColumns.map((column) => (
                <div
                  key={column.id}
                  className="w-[300px] min-w-[300px] rounded-2xl border border-neutral-200 bg-neutral-100/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/60"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {column.title}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {column.tasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openAddTask(column.title)}
                      className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                      aria-label={`Add task to ${column.title}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {column.tasks.map(renderTaskCard)}
                  </div>

                  <button
                    onClick={() => openAddTask(column.title)}
                    className="mt-3 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    <Plus size={15} />
                    Add Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showTaskModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTaskModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
              <div>
                <h2 id="task-modal-title" className="text-lg font-semibold">
                  {editingTask ? "Edit Task" : "Add Task"}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {editingTask
                    ? "Update the task details and save your changes."
                    : "Create a task and place it in the right workflow stage."}
                </p>
              </div>

              <button
                onClick={closeTaskModal}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </span>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      saveTask();
                    }
                  }}
                  placeholder="What needs to be done?"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Add a description..."
                  className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as Status,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950"
                  >
                    {STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Priority</span>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value as Priority,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950"
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Due Date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>

              <div>
                <span className="text-sm font-medium">Labels</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVAILABLE_LABELS.map((label) => {
                    const selected = form.labels.includes(label);

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          selected
                            ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {selected && (
                          <Check className="mr-1 inline" size={12} />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <button
                  onClick={closeTaskModal}
                  disabled={saving}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  onClick={saveTask}
                  disabled={saving || !form.title.trim()}
                  className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                      ? "Save Changes"
                      : "Add Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
