"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";
import { useState } from "react";
import { promoteToBaseline } from "@/lib/actions/changes";
import { useRouter } from "next/navigation";

function ImpactBadge({ score }) {
  if (score < 30)
    return (
      <span className="inline-block text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
        Low
      </span>
    );
  if (score < 70)
    return (
      <span className="inline-block text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        Medium
      </span>
    );
  return (
    <span className="inline-block text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
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
      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}

export default function ChangesTable({
  displayChanges,
  changesError,
  user,
  projectId,
}) {
  const router = useRouter();
  const [promoting, setPromoting] = useState(null);
  const [promotionError, setPromotionError] = useState(null);

  const handlePromote = async (changeId) => {
    setPromoting(changeId);
    setPromotionError(null);

    try {
      const result = await promoteToBaseline(changeId);

      if (result?.success || result?.newBaseline) {
        // Success - refresh the page to show updated baselines
        router.refresh();
        // Optionally redirect to baselines page to show the newly created baseline
        // router.push(`/${user}/${projectId}/baselines`);
      } else {
        throw new Error(result?.error || "Failed to promote to baseline");
      }
    } catch (error) {
      console.error("Error promoting change:", error);
      setPromotionError(error.message);
    } finally {
      setPromoting(null);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800">
      {changesError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-300">
            Error loading changes: {changesError}
          </p>
        </div>
      )}

      {promotionError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-300">
            Error promoting change: {promotionError}
          </p>
        </div>
      )}

      {displayChanges.length === 0 && !changesError ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
          <p className="text-slate-600 dark:text-slate-400">
            No changes proposed yet
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  ID
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Change
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Affected Module
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Impact
                </th>
                <th className="p-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {displayChanges.map((change) => (
                <tr
                  key={change.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {change.customId || `#${change.id}`}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {change.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {change.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {change.affectedModule ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {change.affectedModule}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        None
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={change.status} />
                  </td>
                  <td className="p-4">
                    <ImpactBadge score={change.impact} />
                  </td>
                  <td className="p-4 text-right space-x-2 flex justify-end">
                    <Link
                      href={`/${user}/${projectId}/changes/${change.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      View
                    </Link>
                    {change.status === "Pending" && (
                      <button
                        onClick={() => handlePromote(change.id)}
                        disabled={promoting === change.id}
                        className="text-sm font-medium px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white transition-colors flex items-center gap-1">
                        {promoting === change.id ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            Promoting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Promote
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
