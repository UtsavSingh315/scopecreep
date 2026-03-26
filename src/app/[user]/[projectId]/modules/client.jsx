"use client";

import { useEffect, useState } from "react";
import { Package, Zap, Clock } from "lucide-react";
import { createModule } from "@/lib/actions/projects";

export default function ModulesClient({ initialModules = [], projectId }) {
  const [modules, setModules] = useState(initialModules || []);
  const [name, setName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [deps, setDeps] = useState([]); // Array of {id, type}
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setModules(initialModules || []);
  }, [initialModules]);

  function toggleDep(id) {
    setDeps((d) => {
      const existing = d.find((x) => x.id === id);
      if (existing) {
        return d.filter((x) => x.id !== id);
      } else {
        return [...d, { id, type: "Hard" }]; // Default to Hard
      }
    });
  }

  function updateDepType(id, type) {
    setDeps((d) => d.map((dep) => (dep.id === id ? { ...dep, type } : dep)));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setIsCreating(true);

    try {
      const result = await createModule(projectId, {
        name,
        techStack,
        dependencies: deps,
      });

      if (result.error) {
        console.error("Failed to create module:", result.error);
        alert("Failed to create module: " + result.error);
        setIsCreating(false);
        return;
      }

      if (result.success && result.data) {
        const newModule = result.data;
        setModules((m) => [newModule, ...m]);
        setName("");
        setTechStack("");
        setDeps([]);
      } else {
        alert("Failed to create module");
      }
    } catch (err) {
      console.error("Error creating module:", err);
      alert("Failed to create module: " + (err.message || "Unknown error"));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Dependency Type Legend */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Dependency Types:
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Hard (Critical)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Soft (Flexible)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-400"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Ghost (Indirect)
            </span>
          </div>
        </div>
      </div>

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
                        {m.techStack || "No tech stack specified"}
                      </p>
                    </div>
                  </div>
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

                  {m.dependencyList && m.dependencyList.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Dependencies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.dependencyList.map((dep) => {
                          const depModule = modules.find(
                            (mod) => mod.id === dep.id,
                          );
                          const typeColors = {
                            Hard: "bg-red-500 hover:bg-red-600 shadow-sm",
                            Soft: "bg-amber-500 hover:bg-amber-600 shadow-sm",
                            Ghost: "bg-slate-400 hover:bg-slate-500 shadow-sm",
                          };
                          return depModule ? (
                            <span
                              key={dep.id}
                              title={`${depModule.name} (${dep.type})`}
                              className={`text-xs px-2.5 py-1 rounded text-white font-medium transition-colors cursor-help ${typeColors[dep.type] || typeColors.Hard}`}>
                              {depModule.name}
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
              Dependencies
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700/50">
              {modules.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No other modules available
                </p>
              ) : (
                modules.map((m) => {
                  const isSelected = deps.some((d) => d.id === m.id);
                  const depType =
                    deps.find((d) => d.id === m.id)?.type || "Hard";

                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDep(m.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        {m.name}
                      </span>
                      {isSelected && (
                        <select
                          value={depType}
                          onChange={(e) => updateDepType(m.id, e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="Hard">Hard</option>
                          <option value="Soft">Soft</option>
                          <option value="Ghost">Ghost</option>
                        </select>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              <strong>Hard:</strong> Required dependency
              <br />
              <strong>Soft:</strong> Optional/recommended dependency
              <br />
              <strong>Ghost:</strong> Indirect/implicit dependency
            </p>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={!name || !techStack || isCreating}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors">
              {isCreating ? "Creating..." : "Create Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
