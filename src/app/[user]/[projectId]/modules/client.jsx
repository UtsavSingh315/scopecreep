"use client";

import { useEffect, useState } from "react";
import { Package, Zap, Clock } from "lucide-react";

const complexityColors = {
  Low: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Medium:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  High: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

export default function ModulesClient({ initialModules = [], projectId }) {
  const [modules, setModules] = useState(initialModules || []);
  const [name, setName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [complexity, setComplexity] = useState("Medium");
  const [deps, setDeps] = useState([]);

  useEffect(() => {
    setModules(initialModules || []);
  }, [initialModules]);

  function toggleDep(id) {
    setDeps((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }

  async function handleCreate(e) {
    e.preventDefault();
    const payload = { name, techStack, complexity, dependencies: deps };

    try {
      const user = window.location.pathname.split("/").filter(Boolean)[0];
      const res = await fetch(
        `/api/projects/${encodeURIComponent(user)}/${projectId}/modules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const j = await res.json();
      if (j.ok) {
        const newModule = {
          id: Date.now(),
          name,
          techStack,
          complexity,
          moduleId: `M-${name.split(" ")[0]}`,
          projectId,
          dependencies: deps,
          estimatedDays: 10,
        };
        setModules((m) => [newModule, ...m]);
        setName("");
        setTechStack("");
        setComplexity("Medium");
        setDeps([]);
      } else {
        alert("Create failed: " + j.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create module");
    }
  }

  return (
    <div className="space-y-6">
      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Existing Modules
        </h2>
        {modules.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            No modules yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {m.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {m.moduleId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${complexityColors[m.complexity] || complexityColors.Medium}`}>
                    {m.complexity}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Tech Stack
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white font-mono">
                      {m.techStack}
                    </p>
                  </div>

                  {m.description && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {m.description}
                      </p>
                    </div>
                  )}

                  {m.estimatedDays && (
                    <div className="flex items-center gap-2 pt-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {m.estimatedDays} days
                      </span>
                    </div>
                  )}

                  {m.dependencies && m.dependencies.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Dependencies
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {m.dependencies.map((depId) => {
                          const depModule = modules.find(
                            (mod) => mod.id === depId,
                          );
                          return depModule ? (
                            <span
                              key={depId}
                              className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {depModule.moduleId}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Form */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Create New Module
        </h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Module Name
            </label>
            <input
              type="text"
              placeholder="e.g., Authentication Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tech Stack
            </label>
            <input
              type="text"
              placeholder="e.g., Node.js, Express, PostgreSQL"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Dependencies
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {modules.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deps.includes(m.id)}
                    onChange={() => toggleDep(m.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    {m.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={!name || !techStack}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors">
              Create Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
