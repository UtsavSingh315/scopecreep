"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, AlertCircle, CheckCircle, BarChart3 } from "lucide-react";

function ImpactBar({ score }) {
  const color = score < 30 ? "#10B981" : score < 70 ? "#F59E0B" : "#FB7185";
  const label = score < 30 ? "Low" : score < 70 ? "Medium" : "High";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {score}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ImpactsPage({ params, impacts = [], error = null }) {
  const { user, projectId } = React.use(params);
  const [selectedChange, setSelectedChange] = useState(null);

  const displayImpacts = impacts || [];

  // Config for budget tolerance
  const budgetTolerancePct = 0.15;
  const totalBudget = 100000; // example
  const toleranceAmount = totalBudget * budgetTolerancePct;

  // Calculate cumulative impact
  const totalCostIncrease = displayImpacts.reduce(
    (sum, it) => sum + (it.predictedCostIncrease || 0),
    0,
  );
  const avgImpactScore =
    displayImpacts.length > 0
      ? Math.round(
          displayImpacts.reduce((sum, it) => sum + (it.finalScore || 0), 0) /
            displayImpacts.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Impact Ledger
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Change-by-change impact analysis and cumulative project metrics
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-300">
            Error loading impacts: {error}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold">
              Changes Analyzed
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {displayImpacts.length}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold">
              Avg Impact
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {avgImpactScore}%
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold">
              Total Cost Impact
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            ${(totalCostIncrease / 1000).toFixed(1)}k
          </div>
          <p
            className={`text-xs mt-1 ${totalCostIncrease > toleranceAmount ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            Tolerance: ${(toleranceAmount / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold">
              Budget Status
            </span>
          </div>
          <div
            className={`text-sm font-bold ${totalCostIncrease > toleranceAmount ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {totalCostIncrease > toleranceAmount
              ? "Over Budget"
              : "Within Budget"}
          </div>
        </div>
      </div>

      {displayImpacts.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            No impact data yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Create and analyze changes to see impact metrics
          </p>
        </div>
      ) : (
        <>
          {/* Changes Table */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Change
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Impact Score
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Cost Impact
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Duration
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="p-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {displayImpacts.map((impact) => (
                    <tr
                      key={impact.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() =>
                        setSelectedChange(
                          selectedChange === impact.id ? null : impact.id,
                        )
                      }>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {impact.changeTitle}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {impact.changeId}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-full max-w-xs">
                          <ImpactBar score={impact.finalScore || 0} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          ${((impact.predictedCostIncrease || 0) / 1000).toFixed(1)}k
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Δ Cost
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {impact.predictedDelayDays || 0}d
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Delay
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {(impact.predictedCostIncrease || 0) > toleranceAmount ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                                Over Budget
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Within Budget
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/${user}/${projectId}/changes/${impact.changeId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Impact Score Guide
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Low</strong> (0-30%): Minor scope changes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Medium</strong> (30-70%): Moderate impact
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>High</strong> (70-100%): Significant impact
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Budget Tolerance
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your project has a{" "}
                <strong>{(budgetTolerancePct * 100).toFixed(0)}%</strong>{" "}
                tolerance for cost increases (${(toleranceAmount / 1000).toFixed(1)}k).
                {totalCostIncrease > toleranceAmount && (
                  <span className="block mt-1 text-rose-700 dark:text-rose-300">
                    Current impact exceeds tolerance by $
                    {((totalCostIncrease - toleranceAmount) / 1000).toFixed(1)}k
                  </span>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
