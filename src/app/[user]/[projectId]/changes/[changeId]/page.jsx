"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

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
  const { changeId, projectId, user } = params;

  // Mock data for the change
  const change = {
    id: changeId,
    title: "Add payment gateway integration",
    description: "Integrate Stripe for payment processing with webhook support",
    status: "Approved",
    impact: 72,
    costIncrease: 12000,
    delayDays: 10,
    affectedModules: ["M-Auth", "M-API", "M-DB"],
    recommendation: "Monitor & schedule strategically",
  };

  const [promoting, setPromoting] = useState(false);

  async function handleAcceptAndPromote() {
    setPromoting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setPromoting(false);
    // Navigate back to changes list or impacts
    router.push(`/${user}/${projectId}/impacts`);
  }

  const impactLevel =
    change.impact < 30 ? "Low" : change.impact < 70 ? "Medium" : "High";
  const impactColor =
    change.impact < 30 ? "emerald" : change.impact < 70 ? "amber" : "rose";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/${user}/${projectId}/changes`}
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
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Impact Gauge and Metrics */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 text-center">
              Impact Score
            </h2>
            <div className="flex justify-center mb-6">
              <ImpactGauge score={change.impact} />
            </div>

            <div
              className={`p-3 rounded-lg bg-${impactColor}-100 dark:bg-${impactColor}-900/30 text-center mb-4`}>
              <div
                className={`text-sm font-semibold text-${impactColor}-700 dark:text-${impactColor}-400`}>
                {impactLevel} Impact
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Estimated Cost
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${(change.costIncrease / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="text-slate-600 dark:text-slate-400">
                  Schedule Delay
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {change.delayDays} days
                </span>
              </div>
            </div>
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
                className={`w-5 h-5 text-emerald-600 dark:text-emerald-400`}
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {change.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {change.recommendation}
            </p>
          </div>

          {/* Affected Modules */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Affected Modules
            </h3>
            <div className="flex flex-wrap gap-2">
              {change.affectedModules.map((mod) => (
                <span
                  key={mod}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {mod}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <button
              onClick={handleAcceptAndPromote}
              disabled={promoting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition-colors">
              <CheckCircle className="w-4 h-4" />
              {promoting
                ? "Promoting to baseline..."
                : "Accept & Promote to Baseline"}
            </button>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 text-center">
              This will create a new baseline snapshot with this change
              integrated.
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
