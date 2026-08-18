"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Mail,
  Pencil,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [name, setName] = useState("Guest User");
  const [email, setEmail] = useState("guest@pyramid.com");
  const [title, setTitle] = useState("Designer");
  const [username, setUsername] = useState("Dexuser");
  const [theme, setTheme] = useState<Theme>("system");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("profile-name") || "Guest User");
    setEmail(localStorage.getItem("profile-email") || "guest@pyramid.com");
    setTitle(localStorage.getItem("profile-title") || "Designer");
    setUsername(localStorage.getItem("profile-username") || "Dexuser");
    setTheme((localStorage.getItem("theme-preference") as Theme) || "system");
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", dark);
    }

    localStorage.setItem("theme-preference", theme);
  }, [theme]);

  const saveProfile = () => {
    localStorage.setItem("profile-name", name);
    localStorage.setItem("profile-email", email);
    localStorage.setItem("profile-title", title);
    localStorage.setItem("profile-username", username);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8] text-neutral-900 dark:bg-[#171717] dark:text-neutral-100">
      <div className="mx-auto flex max-w-[1180px] gap-8 px-5 py-8 md:px-8">
        <aside className="hidden w-[220px] shrink-0 md:block">
          <button
            onClick={() => (window.location.href = "/tasks")}
            className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to app
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold shadow-sm dark:bg-neutral-900">
              <User size={17} />
              Profile
            </div>
          </div>
        </aside>

        <section className="w-full max-w-[800px]">
          <button
            onClick={() => (window.location.href = "/tasks")}
            className="mb-5 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white md:hidden"
          >
            <ArrowLeft size={16} />
            Back to app
          </button>

          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Account
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Manage your profile and application preferences.
            </p>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
                <h2 className="font-semibold">Profile</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  These details are stored locally for this demo workspace.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-lg font-bold text-white">
                    GU
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-neutral-500">{email}</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="text-sm font-medium">Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-medium">Email</span>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white py-3 pl-9 pr-3.5 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </div>
                  </label>

                  <label>
                    <span className="text-sm font-medium">Title</span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-medium">Username</span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
                    />
                  </label>
                </div>

                <button
                  onClick={saveProfile}
                  className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {saved ? <Check size={16} /> : <Pencil size={16} />}
                  {saved ? "Saved" : "Save profile"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
                <h2 className="font-semibold">Appearance</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Choose how the application should look.
                </p>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-3">
                {[
                  { value: "light", label: "Light", icon: "☀" },
                  { value: "system", label: "System", icon: "◐" },
                  { value: "dark", label: "Dark", icon: "☾" },
                ].map((option) => {
                  const selected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as Theme)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                        selected
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <span>
                        {option.icon} {option.label}
                      </span>
                      {selected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
                <h2 className="font-semibold">Workspace</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Current workspace information.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="font-medium">Pyramid Workspace</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Guest workspace · Task Management
                  </p>
                </div>
                <ChevronRight className="text-neutral-400" size={18} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}