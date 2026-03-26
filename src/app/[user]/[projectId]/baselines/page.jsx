import { getProjectBaselines } from "@/lib/actions/projects";
import { Calendar, AlertCircle } from "lucide-react";

function BaselineCard({ baseline }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {baseline.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Version {baseline.version || "1.0"}
          </p>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          {baseline.version || "1.0"}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {baseline.description || "No description"}
      </p>
      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {baseline.createdAt
            ? new Date(baseline.createdAt).toLocaleDateString()
            : "N/A"}
        </div>
      </div>
    </div>
  );
}

export default async function BaselinesPage({ params }) {
  const { user, projectId } = await params;

  // Fetch real baselines from database
  const result = await getProjectBaselines(parseInt(projectId));
  const baselines = result.error ? [] : (result.data || []);
  const error = result.error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Baselines
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Project snapshots representing confirmed scope at key milestones
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-300">
            Error loading baselines: {error}
          </p>
        </div>
      )}

      {/* Baselines Grid */}
      {baselines.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            No baselines yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Create a baseline to capture the current project scope
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baselines.map((baseline) => (
            <BaselineCard key={baseline.id} baseline={baseline} />
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Baselines</strong> represent validated project scopes at
          specific points in time. Use them to compare current proposed changes
          against the baseline and track scope creep.
        </p>
      </div>
    </div>
  );
}
