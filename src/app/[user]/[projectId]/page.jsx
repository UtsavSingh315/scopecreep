export default async function ProjectDashboard({ params }) {
  const { user, projectId } = await params;

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
            12
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
          <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-blue-300">
            Total Changes
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-blue-50 mt-2">
            45
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg sm:col-span-2 lg:col-span-1">
          <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-blue-300">
            Scope Creep %
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            23%
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-blue-50 mb-4">
          Recent Activity
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-blue-300">
          No recent activity to display.
        </p>
      </div>
    </div>
  );
}
