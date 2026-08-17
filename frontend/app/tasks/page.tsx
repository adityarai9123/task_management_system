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

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "To Do" | "Doing" | "Completed" | "On Hold" | "Backlog";
  priority: "No Priority" | "Low" | "Medium" | "High" | "Urgent";
  dueDate?: string;
  assignee?: string;
  reporter?: string;
}

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Design task management dashboard",
        priority: "No Priority",
        status: "To Do",
      },
    ],
  },
  {
    id: "doing",
    title: "Doing",
    tasks: [
      {
        id: "2",
        title: "Implement authentication",
        priority: "No Priority",
        dueDate: "20 Aug 2026",
        status: "Doing",
      },
      {
        id: "3",
        title: "Write API",
        priority: "Urgent",
        dueDate: "13 Aug 2026",
        status: "Doing",
      },
    ],
  },
  {
    id: "completed",
    title: "Completed",
    tasks: [
      {
        id: "4",
        title: "Setup project",
        priority: "Urgent",
        dueDate: "12 Aug 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "on-hold",
    title: "On Hold",
    tasks: [
      {
        id: "5",
        title: "Review requirements",
        priority: "No Priority",
        status: "On Hold",
      },
    ],
  },
  {
    id: "backlog",
    title: "Backlog",
    tasks: [
      {
        id: "6",
        title: "Add notifications",
        priority: "No Priority",
        status: "Backlog",
      },
      {
        id: "7",
        title: "Improve dashboard",
        priority: "No Priority",
        status: "Backlog",
      },
    ],
  },
];

export default function TasksPage() {
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFields, setShowFields] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [openTaskMenu, setOpenTaskMenu] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
          priority: "No Priority",
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
      setShowAddTask(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#171717]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen border-r border-[#e5e5e5] bg-white transition-all duration-200 ${
          sidebarOpen ? "w-[256px]" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* User */}
          <div className="flex items-center justify-between border-b border-[#eeeeee] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400 text-xs font-semibold text-white">
                GU
              </div>

              <div>
                <p className="text-sm font-semibold">Guest User</p>
                <p className="text-xs text-[#737373]">guest@pyramid.com</p>
              </div>
            </div>

            <ChevronDown size={16} className="text-[#737373]" />
          </div>

          {/* Navigation */}
          <div className="px-3 py-5">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-[#a3a3a3]">
              Workspace
            </p>

            <button className="mt-3 flex w-full items-center gap-3 rounded-lg bg-[#f1f1f1] px-3 py-2.5 text-sm font-medium">
              <SlidersHorizontal size={17} />
              Tasks
            </button>

            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5]">
              <div className="h-4 w-4 rounded border border-[#737373]" />
              Projects
            </button>
          </div>

          {/* Bottom */}
          <div className="mt-auto border-t border-[#eeeeee] p-3">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5]">
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
        <header className="flex h-[72px] items-center border-b border-[#e5e5e5] bg-white px-7">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-5 rounded-md p-2 hover:bg-[#f3f3f3]"
          >
            {sidebarOpen ? (
              <ChevronLeft size={19} />
            ) : (
              <ChevronRight size={19} />
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <button className="rounded-lg border border-[#e5e5e5] bg-white p-2.5 hover:bg-[#f5f5f5]">
              <Search size={18} />
            </button>

            {/* Fields */}
            <div className="relative">
              <button
                onClick={() => setShowFields(!showFields)}
                className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#f5f5f5]"
              >
                <SlidersHorizontal size={16} />
                Fields
              </button>

              {showFields && (
                <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-lg">
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
                      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[#f5f5f5]"
                    >
                      {field}
                      <input
                        type="checkbox"
                        defaultChecked={
                          field === "Priority" ||
                          field === "Members" ||
                          field === "Due Date"
                        }
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
                className="rounded-lg border border-[#e5e5e5] bg-white p-2.5 hover:bg-[#f5f5f5]"
              >
                <Filter size={18} />
              </button>

              {showFilter && (
                <div className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-lg">
                  <p className="text-sm font-semibold">Filter tasks</p>

                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Urgent
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Has due date
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Assigned to me
                    </label>
                  </div>
                </div>
              )}
            </div>

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
        <section className="px-7 py-7">
          <div className="mb-7">
            <h1 className="text-[28px] font-semibold tracking-[-0.5px]">
              Tasks
            </h1>
          </div>

          {/* Columns */}
          <div className="flex gap-4 overflow-x-auto pb-6">
            {columns.map((column) => (
              <div
                key={column.id}
                className="w-[300px] min-w-[300px] rounded-xl border border-[#e5e5e5] bg-[#f3f3f3] p-3"
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
                  {column.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-5">
                          {task.title}
                        </p>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenTaskMenu(
                                openTaskMenu === task.id ? null : task.id,
                              )
                            }
                            className="shrink-0 rounded-md p-1 hover:bg-[#f3f3f3]"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {openTaskMenu === task.id && (
                            <div className="absolute right-0 top-8 z-30 w-36 rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-lg">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setNewTaskTitle(task.title);
                                  setOpenTaskMenu(null);
                                  setShowAddTask(true);
                                }}
                                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[#f5f5f5]"
                              >
                                Edit
                              </button>

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

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400 text-[8px] font-bold text-white">
                            GU
                          </div>

                          <span className="text-xs text-[#737373]">
                            Guest User
                          </span>
                        </div>

                        {task.dueDate && (
                          <span className="rounded-full bg-[#fff1f1] px-2.5 py-1 text-[11px] font-medium text-[#ef4444]">
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

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
          <div className="w-full max-w-[500px] rounded-2xl border border-[#e5e5e5] bg-white shadow-xl">
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
                className="mt-2 w-full rounded-lg border border-[#d4d4d4] px-3 py-2.5 text-sm outline-none focus:border-[#171717]"
              />

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTaskTitle("");
                    setEditingTask(null);
                  }}
                  className="rounded-lg px-4 py-2.5 text-sm text-[#525252] hover:bg-[#f5f5f5]"
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
