"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Folder } from "lucide-react";
import { createProject } from "@/lib/actions/projects";

export default function ProjectsClient({
  initialProjects = [],
  user,
  error = null,
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setCreating] = useState(false);
  const router = useRouter();

  async function createProject(e) {
    e.preventDefault();
    setCreating(true);
    const customId = `PX${Date.now().toString().slice(-6)}`;

    try {
      const result = await createProject({
        name,
        description,
        customId,
      });

      if (result.error) {
        console.error("Failed to create project:", result.error);
        alert("Failed to create project. Please try again.");
        setCreating(false);
        return;
      }

      const created = result.data;
      setProjects((s) => [created, ...s]);
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/${user}/${created.customId}`);
    } catch (err) {
      console.error("Error creating project:", err);
      alert("An error occurred. Please try again.");
    }
    setCreating(false);
  }

  return (
    <div className="space-y-8">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track your project scopes
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          <Folder className="w-12 h-12 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            No projects yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.customId} href={`/${user}/${p.customId}`}>
              <div className="group h-full p-5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {p.customId}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {p.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {p.description || "No description"}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400"
                    }`}>
                    {p.status || "active"}
                  </span>
                  <time>{p.createdAt}</time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={createProject}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Create New Project
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Set up a new project to start tracking scope changes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mobile App Redesign"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the project..."
                rows="3"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !name}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors">
                {isCreating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
