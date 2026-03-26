"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from "lucide-react";
import {
  getChangeRequestById,
  getImpactResultsByChangeId,
  getProjectModules,
} from "@/lib/actions/projects";

function ImpactGauge({ score = 0 }) {
  const color = score < 30 ? "#10B981" : score < 70 ? "#F59E0B" : "#FB7185";
  return (
    <div className="w-full max-w-xs aspect-square">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path
          d="M5 45 A45 45 0 0 1 95 45"
          fill="none"
          stroke="#0f172a20"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M5 45 A45 45 0 0 1 95 45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          style={{ pathLength: score / 100 }}
        />
        <text
          x="50"
          y="30"
          textAnchor="middle"
          className="text-sm font-semibold fill-slate-900 dark:fill-blue-100">
          {Math.round(score)}%
        </text>
      </svg>
    </div>
  );
}

export default function ChangeDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Use destructuring with a check for undefined/null
  const changeIdParam = params?.changeId;
  const projectIdParam = params?.projectId;
  const userParam = params?.user;

  const [change, setChange] = useState(null);
  const [impact, setImpact] = useState(null);
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadChangeData() {
      try {
        setLoading(true);
        setError(null);

        const changeIdNum = parseInt(changeIdParam);
        console.log(
          "Loading change with ID:",
          changeIdNum,
          "from URL:",
          changeIdParam,
          "Project ID:",
          projectIdParam,
        );

        // Fetch change request with project validation
        const changeData = await getChangeRequestById(changeIdNum, projectIdParam);
        console.log("Change data result:", changeData);

        if (!changeData) {
          throw new Error(
            `Change request with ID ${changeIdNum} not found. The change may have been deleted or doesn't exist in this project.`,
          );
        }
        setChange(changeData);

        // Fetch impact results
        const impactData = await getImpactResultsByChangeId(changeIdNum);
        console.log("Impact data result:", impactData);
        setImpact(impactData);

        // Fetch modules for name resolution
        const modulesData = await getProjectModules(projectIdParam);
        console.log("Modules data result:", modulesData);

        // Handle the response format - it returns {success, data} or {error}
        const modulesList = modulesData?.data || [];
        setModules(modulesList);
      } catch (err) {
        console.error("Error in loadChangeData:", err);
        setError(err.message || "Failed to load change details");
      } finally {
        setLoading(false);
      }
    }

    if (changeIdParam && projectIdParam) {
      loadChangeData();
    }
  }, [changeIdParam, projectIdParam]);

  const [promoting, setPromoting] = useState(false);
  const [implementing, setImplementing] = useState(false);

  async function handleAcceptAndPromote() {
    setPromoting(true);
    try {
      // Import the promoteToBaseline function from changes actions
      const { promoteToBaseline } = await import("@/lib/actions/changes");

      const changeIdNum = parseInt(changeIdParam);
      await promoteToBaseline(changeIdNum);
      // Reload the page to show updated status
      window.location.reload();
    } catch (err) {
      console.error("Error promoting to baseline:", err);
      alert("Failed to promote to baseline: " + err.message);
    } finally {
      setPromoting(false);
    }
  }

  async function handleImplementChange() {
    setImplementing(true);
    try {
      const { implementChange } = await import("@/lib/actions/changes");

      const changeIdNum = parseInt(changeIdParam);
      await implementChange(changeIdNum);
      // Reload the page to show updated status
      window.location.reload();
    } catch (err) {
      console.error("Error implementing change:", err);
      alert("Failed to implement change: " + err.message);
    } finally {
      setImplementing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading change details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href={`/${userParam}/${projectIdParam}/changes`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          Back to Changes
        </Link>
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                Error
              </h3>
              <p className="text-red-800 dark:text-red-200 text-sm mt-1">
                {error}
              </p>
              <p className="text-red-700 dark:text-red-300 text-xs mt-3">
                💡 Tip: Go back to the Changes page to view all available
                changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!change) {
    return (
      <div className="space-y-6">
        <Link
          href={`/${userParam}/${projectIdParam}/changes`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          Back to Changes
        </Link>
        <p className="text-slate-600">Change request not found</p>
      </div>
    );
  }

  const primaryModule = modules?.find((m) => m.id === change.primaryModuleId);
  const moduleName = primaryModule?.name || "Unknown Module";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/${userParam}/${projectIdParam}/changes`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Changes
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {change.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {change.description}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          <strong>Module:</strong> {moduleName}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Impact Gauge and Metrics */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 text-center">
              Impact Score
            </h2>
            {impact ? (
              <>
                <div className="flex justify-center mb-6">
                  <ImpactGauge score={impact.finalScore} />
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    impact.finalScore < 30
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : impact.finalScore < 70
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-rose-100 dark:bg-rose-900/30"
                  } text-center mb-4`}>
                  <div
                    className={`text-sm font-semibold ${
                      impact.finalScore < 30
                        ? "text-emerald-700 dark:text-emerald-400"
                        : impact.finalScore < 70
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-rose-700 dark:text-rose-400"
                    }`}>
                    {impact.finalScore < 30
                      ? "Low"
                      : impact.finalScore < 70
                        ? "Medium"
                        : "High"}{" "}
                    Impact
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Cost Increase
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${(impact.predictedCostIncrease || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                    <span className="text-slate-600 dark:text-slate-400">
                      Predicted Delay
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(impact.predictedDelayDays || 0).toFixed(1)} days
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Impact results not available
              </p>
            )}
          </div>
        </div>

        {/* Right: Details and Action */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Card */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Status
            </h3>
            <div className="flex items-center gap-3">
              <CheckCircle
                className={`w-5 h-5 ${
                  change.status === "approved" || change.status === "Approved"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {change.status || "Pending"}
              </span>
            </div>
            {impact?.recommendationText && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {impact.recommendationText}
              </p>
            )}
          </div>

          {/* Change Scope */}
          {change.numericDeltas &&
            Object.values(change.numericDeltas).some((v) => v > 0) && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Change Scope
                </h3>
                <div className="space-y-2 text-sm">
                  {change.numericDeltas.new_screens > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        New Screens
                      </span>
                      <span className="font-semibold">
                        {change.numericDeltas.new_screens}
                      </span>
                    </div>
                  )}
                  {change.numericDeltas.external_integrations > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Integrations
                      </span>
                      <span className="font-semibold">
                        {change.numericDeltas.external_integrations}
                      </span>
                    </div>
                  )}
                  {change.numericDeltas.db_schema_changes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Schema Changes
                      </span>
                      <span className="font-semibold">
                        {change.numericDeltas.db_schema_changes}
                      </span>
                    </div>
                  )}
                  {change.numericDeltas.logic_rules > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Logic Rules
                      </span>
                      <span className="font-semibold">
                        {change.numericDeltas.logic_rules}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Action Button */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="space-y-3">
              <button
                onClick={handleAcceptAndPromote}
                disabled={promoting || change.status === "Accepted" || change.status === "Implemented"}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors">
                <CheckCircle className="w-4 h-4" />
                {change.status === "Implemented"
                  ? "Already Implemented"
                  : change.status === "Accepted"
                    ? "Promoted to Baseline"
                    : promoting
                      ? "Promoting to baseline..."
                      : "Accept & Promote to Baseline"}
              </button>

              {change.status === "Accepted" && (
                <button
                  onClick={handleImplementChange}
                  disabled={implementing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  {implementing
                    ? "Marking as Implemented..."
                    : "Mark as Implemented"}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 text-center">
              {change.status === "Implemented"
                ? "This change has been implemented and applied to the baseline."
                : change.status === "Accepted"
                  ? "This change has been promoted to a baseline. You can now implement it."
                  : "This will create a new baseline snapshot with this change integrated."}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          What Happens Next?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
          <li>Accepting this change will validate the impact analysis</li>
          <li>A new baseline snapshot will be created with this change</li>
          <li>Project timeline and budget will be updated accordingly</li>
          <li>All team members will be notified of the changes</li>
        </ul>
      </div>
    </div>
  );
}
