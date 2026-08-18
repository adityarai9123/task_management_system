"use client";

import {
  ArrowLeft,
  FolderKanban,
  MoreHorizontal,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "task-management",
    name: "Task Management",
    description: "Plan, organize and track tasks across the workspace.",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("workspace-projects");
      if (stored) setProjects(JSON.parse(stored));
    } catch {
      // Keep defaults if local storage is unavailable/corrupt.
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
      },
    ]);

    setName("");
    setDescription("");
    setShowModal(false);
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8] text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
      <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8">
        <button
          onClick={() => (window.location.href = "/tasks")}
          className="mb-7 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to tasks
        </button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Workspace
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Organize work into focused project spaces.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 self-start rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus size={17} />
            New Project
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <FolderKanban size={20} />
                </div>

                <button
                  onClick={() =>
                    saveProjects(projects.filter((item) => item.id !== project.id))
                  }
                  className="rounded-lg p-1.5 text-neutral-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30"
                  aria-label={`Delete ${project.name}`}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <h2 className="mt-5 text-base font-semibold">{project.name}</h2>
              <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                {project.description}
              </p>

              <button
                onClick={() => (window.location.href = "/tasks")}
                className="mt-5 text-sm font-medium text-neutral-700 hover:underline dark:text-neutral-200"
              >
                Open tasks →
              </button>
            </article>
          ))}

          <button
            onClick={() => setShowModal(true)}
            className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/50 text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/30 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          >
            <Plus size={22} />
            <span className="mt-2 text-sm font-medium">Create another project</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-[500px] rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
              <div>
                <h2 className="font-semibold">New Project</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Create a project for this workspace.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <label className="block">
                <span className="text-sm font-medium">Project name *</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createProject();
                  }}
                  placeholder="e.g. Website Redesign"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What is this project about?"
                  className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!name.trim()}
                  className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
