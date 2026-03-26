import React from "react";

export default async function BaselineDetail({ params }) {
  const { user, projectId, baselineId } = params;
  let rows = [];
  try {
    const db = await import("@/lib/dbClient");
    rows = (await db.leftJoinBaselineModules?.(baselineId)) || [];
  } catch {
    // mock fallback
    rows = [
      {
        moduleName: "Auth",
        screen_count: 5,
        integration_count: 1,
        logic_rule_count: 2,
        complexity_score: 5,
      },
      {
        moduleName: "Payments",
        screen_count: 8,
        integration_count: 2,
        logic_rule_count: 5,
        complexity_score: 7,
      },
    ];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Baseline {baselineId}</h1>
        <p className="text-sm text-slate-400">
          Snapshot of modules for this baseline
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {rows.map((r, idx) => (
          <details
            key={idx}
            className="bg-slate-900/60 border border-white/6 rounded-lg p-4">
            <summary className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold">{r.moduleName}</div>
                <div className="text-xs text-slate-400">
                  Tech stack: {r.tech_stack || "unknown"}
                </div>
              </div>
              <div className="text-sm text-slate-300">
                Screens:{" "}
                <span className="font-mono ml-1">{r.screen_count}</span>
                <span className="ml-3">
                  {" "}
                  Integrations:{" "}
                  <span className="font-mono">{r.integration_count}</span>
                </span>
              </div>
            </summary>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/40 rounded">
                <div className="text-xs text-slate-400">Logic Rules</div>
                <div className="font-semibold">{r.logic_rule_count}</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded">
                <div className="text-xs text-slate-400">Complexity Score</div>
                <div className="font-semibold">{r.complexity_score}</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded">
                <div className="text-xs text-slate-400">Notes</div>
                <div className="text-sm text-slate-300">
                  Snapshot captured at baseline lock time.
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button className="px-3 py-2 rounded-md bg-indigo-600 text-white">
                Open Comparison
              </button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
