import { getProjectBaselines, getProjectChanges } from "@/lib/actions/projects";

export default async function ProjectDashboard({ params }) {
  const { user, projectId } = await params;

  // Fetch real data from database
  const baselinesResult = await getProjectBaselines(projectId);
  const baselines = baselinesResult.error ? [] : baselinesResult.data || [];

  const changesResult = await getProjectChanges(projectId);
  const changes = changesResult.error ? [] : changesResult.data || [];

  // Calculate scope creep percentage
  // Count accepted changes vs total changes
  const acceptedChanges = changes.filter(
    (c) => c.status === "Accepted" || c.status === "accepted",
  ).length;
  const scopeCreepPct =
    changes.length > 0
      ? Math.round((acceptedChanges / changes.length) * 100)
      : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-blue-100">
          Project Dashboard
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-blue-300 mt-2">
          Project ID: {projectId}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
          <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-blue-300">
            Total Baselines
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-blue-50 mt-2">
            {baselines.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
          <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-blue-300">
            Total Changes
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-blue-50 mt-2">
            {changes.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg sm:col-span-2 lg:col-span-1">
          <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-blue-300">
            Accepted Changes %
          </h3>
          <p
            className={`text-2xl md:text-3xl font-bold mt-2 ${
              scopeCreepPct > 50
                ? "text-red-600 dark:text-red-400"
                : scopeCreepPct > 25
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
            }`}>
            {scopeCreepPct}%
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-blue-50 mb-4">
          Recent Changes
        </h2>
        {changes.length === 0 ? (
          <p className="text-sm md:text-base text-slate-600 dark:text-blue-300">
            No changes to display.
          </p>
        ) : (
          <div className="space-y-3">
            {changes.slice(-5).map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {change.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        change.status === "Accepted"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}>
                      {change.status || "Pending"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
