import ModulesClient from "./client";
import { getProjectModules } from "@/lib/actions/projects";

export default async function ModulesPage({ params }) {
  const { user, projectId } = await params;

  // Fetch real modules from database (projectId is customId string like "PX123456")
  const result = await getProjectModules(projectId);
  const modules = result.error ? [] : result.data || [];
  const error = result.error;

  // Serialize modules with date strings
  const serializedModules = modules.map((m) => ({
    ...m,
    createdAt: m.createdAt
      ? new Date(m.createdAt).toISOString().split("T")[0]
      : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Architecture Modules
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Organize your system into logical modules and track dependencies
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-300">
            Error loading modules: {error}
          </p>
        </div>
      )}

      <ModulesClient
        initialModules={serializedModules}
        projectId={projectId}
        user={user}
      />
    </div>
  );
}
