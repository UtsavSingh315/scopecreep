import React from "react";

export default function ProjectConfigPage({ params }) {
  const { projectId } = params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure budget and schedule tolerances and hourly rate for project{" "}
          <span className="font-semibold">{projectId}</span>.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-slate-700 dark:text-blue-200">
          Placeholder form — wire these inputs to your Drizzle queries later.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-blue-200">
              Budget Tolerance (%)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1"
              defaultValue="15"
            />
            <p className="text-xs text-slate-500 mt-1">
              E.g. 15 means 15% overrun allowed
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-blue-200">
              Schedule Tolerance (%)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1"
              defaultValue="10"
            />
            <p className="text-xs text-slate-500 mt-1">
              E.g. 10 means 10% schedule slip tolerated
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-blue-200">
              Hourly Rate (USD)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1"
              defaultValue="120"
            />
            <p className="text-xs text-slate-500 mt-1">
              Billing rate used to estimate cost impact
            </p>
          </div>
        </div>

        <div className="mt-4">
          <button className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
