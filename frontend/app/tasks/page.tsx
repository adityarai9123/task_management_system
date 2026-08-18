"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

import { useEffect, useState } from "react";
import ThemeToggle from "../components/themeToggle";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "To Do" | "Doing" | "Completed" | "On Hold" | "Backlog";
  priority: "No Priority" | "Low" | "Medium" | "High" | "Urgent";
  dueDate?: string;
  labels?: string[];
  assignee?: string;
  reporter?: string;
}

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const availableLabels = ["Bug", "Feature", "Improvement", "Documentation"];

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [],
  },
  {
    id: "doing",
    title: "Doing",
    tasks: [],
  },
  {
    id: "completed",
    title: "Completed",
    tasks: [],
  },
  {
    id: "on-hold",
    title: "On Hold",
    tasks: [],
  },
  {
    id: "backlog",
    title: "Backlog",
    tasks: [],
  },
];

export default function TasksPage() {
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFields, setShowFields] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newTaskPriority, setNewTaskPriority] =
    useState<Task["priority"]>("No Priority");
  const [showSearch, setShowSearch] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterAssignee, setFilterAssignee] = useState<string>("All");

  const [visibleFields, setVisibleFields] = useState({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskLabels, setNewTaskLabels] = useState<string[]>([]);

  const [openTaskMenu, setOpenTaskMenu] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskMenuPosition, setTaskMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();

        const tasks: Task[] = data.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          labels: task.labels || [],
          assignee: task.assignee || "Guest User",
          reporter: task.reporter || "Guest User",
        }));

        const newColumns = initialColumns.map((column) => ({
          ...column,
          tasks: tasks.filter((task) => task.status === column.title),
        }));

        setColumns(newColumns);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: "",
          status: "To Do",
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
          labels: newTaskLabels,
          assignee: "Guest User",
          reporter: "Guest User",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await response.json();

      const task: Task = {
        id: createdTask._id,
        title: createdTask.title,
        description: createdTask.description,
        status: createdTask.status,
        priority: createdTask.priority,
        dueDate: createdTask.dueDate,
        labels: createdTask.labels || [],
        assignee: createdTask.assignee || "Guest User",
        reporter: createdTask.reporter || "Guest User",
      };

      setColumns((current) =>
        current.map((column) =>
          column.title === task.status
            ? {
                ...column,
                tasks: [...column.tasks, task],
              }
            : column,
        ),
      );

      setNewTaskTitle("");
      setNewTaskPriority("No Priority");
      setNewTaskDueDate("");
      setNewTaskLabels([]);
      setShowAddTask(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setDeletingTask(taskId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setColumns((current) =>
        current.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        })),
      );

      setOpenTaskMenu(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingTask(null);
    }
  };

  const updateTask = async () => {
    if (!editingTask || !newTaskTitle.trim()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTaskTitle.trim(),
            dueDate: newTaskDueDate || undefined,
            labels: newTaskLabels,
            priority: newTaskPriority,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      const task: Task = {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        labels: updatedTask.labels || [],
        assignee: updatedTask.assignee || "Guest User",
        reporter: updatedTask.reporter || "Guest User",
      };

      setColumns((current) =>
        current.map((column) => ({
          ...column,
          tasks: column.tasks.map((existingTask) =>
            existingTask.id === task.id ? task : existingTask,
          ),
        })),
      );

      setEditingTask(null);
      setNewTaskTitle("");
      setNewTaskPriority("No Priority");
      setNewTaskDueDate("");
      setNewTaskLabels([]);
      setShowAddTask(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const changeTaskStatus = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();

      const task: Task = {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        assignee: updatedTask.assignee || "Guest User",
        reporter: updatedTask.reporter || "Guest User",
      };

      setColumns((current) =>
        current.map((column) => ({
          ...column,
          tasks:
            column.title === task.status
              ? [...column.tasks, task]
              : column.tasks.filter(
                  (existingTask) => existingTask.id !== task.id,
                ),
        })),
      );

      setOpenTaskMenu(null);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        openTaskMenu &&
        !target.closest("[data-task-menu]") &&
        !target.closest("[data-task-menu-button]")
      ) {
        setOpenTaskMenu(null);
        setTaskMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openTaskMenu]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#171717] dark:bg-[#171717] dark:text-[#ededed]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen border-r border-[#e5e5e5] bg-white dark:border-[#404040] dark:bg-[#1f1f1f] transition-all duration-200 ${
          sidebarOpen ? "w-[256px]" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* User */}
          <div className="flex items-center justify-between border-b border-[#eeeeee] px-5 py-5 dark:border-[#404040]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400 text-xs font-semibold text-white">
                GU
              </div>

              <div>
                <p className="text-sm font-semibold">Guest User</p>
                <p className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                  guest@pyramid.com
                </p>
              </div>
            </div>

            <ChevronDown size={16} className="text-[#737373]" />
          </div>

          {/* Navigation */}
          <div className="px-3 py-5">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-[#a3a3a3]">
              Workspace
            </p>

            <button className="mt-3 flex w-full items-center gap-3 rounded-lg bg-[#f1f1f1] px-3 py-2.5 text-sm font-medium text-[#171717] dark:bg-[#333333] dark:text-[#ededed]">
              <SlidersHorizontal size={17} />
              Tasks
            </button>

            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] dark:text-[#ededed] dark:hover:bg-[#333333]">
              <div className="h-4 w-4 rounded border border-[#737373]" />
              Projects
            </button>
          </div>

          {/* Bottom */}
          <div className="mt-auto border-t border-[#eeeeee] p-3 dark:border-[#404040]">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] dark:text-[#ededed] dark:hover:bg-[#333333]">
              <Settings size={17} />
              Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main
        className={`transition-all duration-200 ${
          sidebarOpen ? "ml-[256px]" : "ml-0"
        }`}
      >
        {/* Top bar */}
        <header className="flex h-[72px] items-center border-b border-[#e5e5e5] bg-white px-7 dark:border-[#404040] dark:bg-[#1f1f1f]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-5 rounded-md p-2 hover:bg-[#f3f3f3] dark:hover:bg-[#333333]"
          >
            {sidebarOpen ? (
              <ChevronLeft size={19} />
            ) : (
              <ChevronRight size={19} />
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}

            <div className="relative flex items-center">
              {showSearch && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="mr-2 w-52 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#171717] dark:border-[#404040] dark:bg-[#2a2a2a] dark:text-[#ededed] dark:placeholder:text-[#a3a3a3]"
                />
              )}

              <button
                onClick={() => {
                  setShowSearch(!showSearch);

                  if (showSearch) {
                    setSearchQuery("");
                  }
                }}
                className="rounded-lg border border-[#e5e5e5] bg-white p-2.5 text-[#171717] hover:bg-[#f5f5f5] dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed] dark:hover:bg-[#333333]"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Fields */}
            <div className="relative">
              <button
                onClick={() => setShowFields(!showFields)}
                className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#171717] hover:bg-[#f5f5f5] dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed] dark:hover:bg-[#333333]"
              >
                <SlidersHorizontal size={16} />
                Fields
              </button>

              {showFields && (
                <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-[#e5e5e5] bg-white p-2 text-[#171717] shadow-lg dark:border-[#404040] dark:bg-[#2a2a2a] dark:text-[#ededed]">
                  {[
                    "Priority",
                    "Members",
                    "Due Date",
                    "Labels",
                    "Status",
                    "Reporter",
                  ].map((field) => (
                    <label
                      key={field}
                      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
                    >
                      {field}

                      <input
                        type="checkbox"
                        checked={
                          visibleFields[
                            field === "Priority"
                              ? "priority"
                              : field === "Members"
                                ? "members"
                                : field === "Due Date"
                                  ? "dueDate"
                                  : field === "Labels"
                                    ? "labels"
                                    : field === "Status"
                                      ? "status"
                                      : "reporter"
                          ]
                        }
                        onChange={() => {
                          const key =
                            field === "Priority"
                              ? "priority"
                              : field === "Members"
                                ? "members"
                                : field === "Due Date"
                                  ? "dueDate"
                                  : field === "Labels"
                                    ? "labels"
                                    : field === "Status"
                                      ? "status"
                                      : "reporter";

                          setVisibleFields((current) => ({
                            ...current,
                            [key]: !current[key],
                          }));
                        }}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="rounded-lg border border-[#e5e5e5] bg-white p-2.5 text-[#171717] hover:bg-[#f5f5f5] dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed] dark:hover:bg-[#333333]"
              >
                <Filter size={18} />
              </button>

              {showFilter && (
                <div className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-[#e5e5e5] bg-white p-4 text-[#171717] shadow-lg dark:border-[#404040] dark:bg-[#2a2a2a] dark:text-[#ededed]">
                  <p className="text-sm font-semibold">Filter tasks</p>

                  <div className="mt-4">
                    <label className="text-xs font-medium text-[#737373]">
                      Priority
                    </label>

                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#171717] outline-none dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed]"
                    >
                      <option value="All">All priorities</option>
                      <option value="No Priority">No Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-medium text-[#737373]">
                      Assignee
                    </label>

                    <select
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#171717] outline-none dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed]"
                    >
                      <option value="All">All members</option>
                      <option value="Guest User">Guest User</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setFilterPriority("All");
                      setFilterAssignee("All");
                    }}
                    className="mt-4 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Theme */}
            <ThemeToggle />

            {/* Add Task */}
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2b2b2b]"
            >
              <Plus size={17} />
              Add Task
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="px-7 py-7 overflow-visible">
          <div className="mb-7">
            <h1 className="text-[28px] font-semibold tracking-[-0.5px]">
              Tasks
            </h1>
          </div>

          {/* Columns */}
          <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-6">
            {columns.map((column) => (
              <div
                key={column.id}
                className="w-[300px] min-w-[300px] rounded-xl border border-[#e5e5e5] bg-[#f3f3f3] p-3 dark:border-[#404040] dark:bg-[#242424]"
              >
                {/* Column heading */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {column.title}
                    </span>

                    <span className="text-xs text-[#8a8a8a]">
                      {column.tasks.length}
                    </span>
                  </div>

                  <button className="rounded-md p-1 hover:bg-[#e7e7e7]">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Tasks */}
                <div className="space-y-2.5">
                  {column.tasks
                    .filter((task) =>
                      task.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    )
                    .filter(
                      (task) =>
                        filterPriority === "All" ||
                        task.priority === filterPriority,
                    )
                    .filter(
                      (task) =>
                        filterAssignee === "All" ||
                        (task.assignee || "Guest User") === filterAssignee,
                    )
                    .map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-[#404040] dark:bg-[#2a2a2a]"
                      >
                        {/* Task title + menu */}
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium leading-5">
                            {task.title}
                          </p>

                          <div className="relative">
                            <button
                              data-task-menu-button
                              onClick={(e) => {
                                if (openTaskMenu === task.id) {
                                  setOpenTaskMenu(null);
                                  setTaskMenuPosition(null);
                                  return;
                                }

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                const menuHeight = 365;
                                const spaceBelow =
                                  window.innerHeight - rect.bottom;

                                setTaskMenuPosition({
                                  top:
                                    spaceBelow < menuHeight
                                      ? Math.max(8, rect.top - menuHeight - 4)
                                      : rect.bottom + 4,
                                  left: rect.right - 176,
                                });

                                setOpenTaskMenu(task.id);
                              }}
                              className="shrink-0 rounded-md p-1 hover:bg-[#f3f3f3]"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {openTaskMenu === task.id && (
                              <div
                                data-task-menu
                                className="fixed z-50 w-44 rounded-lg border border-[#e5e5e5] bg-white p-1 text-[#171717] shadow-lg dark:border-[#404040] dark:bg-[#2a2a2a] dark:text-[#ededed]"
                                style={{
                                  top: taskMenuPosition?.top ?? 0,
                                  left: taskMenuPosition?.left ?? 0,
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setEditingTask(task);
                                    setNewTaskTitle(task.title);
                                    setNewTaskPriority(task.priority);
                                    setNewTaskDueDate(task.dueDate || "");
                                    setNewTaskLabels(task.labels || []);
                                    setOpenTaskMenu(null);
                                    setTaskMenuPosition(null);
                                    setShowAddTask(true);
                                  }}
                                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
                                >
                                  Edit
                                </button>

                                <div className="my-1 border-t border-[#eeeeee] dark:border-[#404040]" />

                                <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
                                  Change status
                                </p>

                                {(
                                  [
                                    "To Do",
                                    "Doing",
                                    "Completed",
                                    "On Hold",
                                    "Backlog",
                                  ] as Task["status"][]
                                ).map((status) => (
                                  <button
                                    key={status}
                                    disabled={task.status === status}
                                    onClick={() => {
                                      changeTaskStatus(task.id, status);
                                      setOpenTaskMenu(null);
                                      setTaskMenuPosition(null);
                                    }}
                                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                                      task.status === status
                                        ? "cursor-default text-[#a3a3a3]"
                                        : "hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}

                                <div className="my-1 border-t border-[#eeeeee] dark:border-[#404040]" />

                                <button
                                  onClick={() => deleteTask(task.id)}
                                  disabled={deletingTask === task.id}
                                  className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-[#fef2f2] disabled:opacity-50"
                                >
                                  {deletingTask === task.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Optional task fields */}
                        {visibleFields.priority && (
                          <div className="mt-2 text-xs text-[#737373] dark:text-[#a3a3a3]">
                            Priority: {task.priority}
                          </div>
                        )}

                        {visibleFields.status && (
                          <div className="mt-1 text-xs text-[#737373] dark:text-[#a3a3a3]">
                            Status: {task.status}
                          </div>
                        )}

                        {visibleFields.reporter && (
                          <div className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                            Reporter: {task.reporter || "Guest User"}
                          </div>
                        )}

                        {visibleFields.labels &&
                          task.labels &&
                          task.labels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {task.labels.map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full bg-[#f3f3f3] px-2.5 py-1 text-[11px] font-medium text-[#525252] dark:bg-[#333333] dark:text-[#d4d4d4]"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* Assignee + Due Date */}
                        {(visibleFields.members ||
                          (visibleFields.dueDate && task.dueDate)) && (
                          <div className="mt-4 flex items-center justify-between">
                            {visibleFields.members && (
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400 text-[8px] font-bold text-white">
                                  GU
                                </div>

                                <span className="text-xs text-[#737373]">
                                  {task.assignee || "Guest User"}
                                </span>
                              </div>
                            )}

                            {visibleFields.dueDate && task.dueDate && (
                              <span className="rounded-full bg-[#fff1f1] px-2.5 py-1 text-[11px] font-medium text-[#ef4444]">
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* </div> */}

                {/* Add inside column */}
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-3 flex w-full items-center gap-2 px-1 py-2 text-sm text-[#737373] hover:text-[#171717]"
                >
                  <Plus size={15} />
                  Add Task
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[500px] rounded-2xl border border-[#e5e5e5] bg-white text-[#171717] shadow-xl dark:border-[#404040] dark:bg-[#2a2a2a] dark:text-[#ededed]">
            <div className="border-b border-[#eeeeee] px-6 py-5">
              <h2 className="text-lg font-semibold">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
            </div>

            <div className="p-6">
              <label className="text-sm font-medium">Title</label>

              <input
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    editingTask ? updateTask() : addTask();
                  }
                }}
                placeholder="What needs to be done?"
                className="mt-2 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#171717] dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed] dark:placeholder:text-[#a3a3a3]"
              />

              <div className="mt-5">
                <label className="text-sm font-medium">Due Date</label>

                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#171717] dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#ededed]"
                />
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium">Labels</label>

                <div className="mt-2 flex flex-wrap gap-2">
                  {availableLabels.map((label) => {
                    const selected = newTaskLabels.includes(label);

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setNewTaskLabels((current) =>
                            current.includes(label)
                              ? current.filter((item) => item !== label)
                              : [...current, label],
                          );
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          selected
                            ? "border-[#171717] bg-[#171717] text-white dark:border-white dark:bg-white dark:text-[#171717]"
                            : "border-[#d4d4d4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#404040] dark:bg-[#1f1f1f] dark:text-[#d4d4d4] dark:hover:bg-[#333333]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium">Priority</label>

                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(e.target.value as Task["priority"])
                  }
                  className="mt-2 w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#171717] dark:border-[#404040] dark:bg-[#2a2a2a] dark:text-[#ededed]"
                >
                  <option value="No Priority">No Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTaskTitle("");
                    setNewTaskPriority("No Priority");
                    setNewTaskDueDate("");
                    setNewTaskLabels([]);
                    setEditingTask(null);
                  }}
                  className="rounded-lg px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5] dark:hover:bg-[#333333] "
                >
                  Cancel
                </button>

                <button
                  onClick={editingTask ? updateTask : addTask}
                  className="rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2b2b2b]"
                >
                  {editingTask ? "Save Changes" : "Add Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
