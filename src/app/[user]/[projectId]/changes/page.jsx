import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { getProjectChanges, getProjectModules } from "@/lib/actions/projects";
import ChangesTable from "./ChangesTable";

function ImpactBadge({ score }) {
  if (score < 30)
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
        Low
      </span>
    );
  if (score < 70)
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        Medium
      </span>
    );
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
      High
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Approved:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    Pending:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    "In Progress":
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    Rejected:
      "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  };
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}

export default async function ChangesPage({ params }) {
  const { user, projectId } = await params;

  // Fetch real changes from database (projectId is customId string like "PX123456")
  const changesResult = await getProjectChanges(projectId);
  const changes = changesResult.error ? [] : changesResult.data || [];
  const changesError = changesResult.error;

  // Fetch modules to resolve dependencies
  const modulesResult = await getProjectModules(projectId);
  const modules = modulesResult.error ? [] : modulesResult.data || [];

  // Create module map for quick lookup
  const moduleMap = {};
  modules.forEach((m) => {
    moduleMap[m.id] = m;
  });

  // Map database changes to display format with serialized dates and module names
  const displayChanges = changes.map((change) => ({
    id: change.id,
    title: change.title,
    description: change.description || "",
    status: change.status,
    createdAt: change.createdAt
      ? new Date(change.createdAt).toISOString().split("T")[0]
      : null,
    impact: change.impactScore || 0,
    primaryModuleId: change.primaryModuleId,
    affectedModule:
      change.primaryModuleId && moduleMap[change.primaryModuleId]
        ? moduleMap[change.primaryModuleId].name
        : null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Changes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Proposed changes and their impact analysis
          </p>
        </div>
        <Link
          href={`/${user}/${projectId}/changes/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Change
        </Link>
      </div>

      {/* Changes List */}
      <ChangesTable
        displayChanges={displayChanges}
        changesError={changesError}
        user={user}
        projectId={projectId}
      />

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Changes</strong> are proposed modifications to your project
          scope. Each change is analyzed for impact on timeline, budget, and
          architecture.
        </p>
      </div>
    </div>
  );
}
