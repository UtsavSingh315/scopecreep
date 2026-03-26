"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Layout,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SCORING_WEIGHTS = {
  sliders: {
    technical_complexity: 0.15,
    stakeholder_priority: 0.05,
    resource_availability: 0.1,
    architecture_impact: 0.15,
    dependency_depth: 0.1,
    revenue_roi: 0.05,
  },
  numerics: {
    new_screens: 0.1,
    external_integrations: 0.15,
    db_schema_changes: 0.1,
    logic_rules: 0.05,
  },
};

const SLIDER_LABELS = {
  technical_complexity: "Technical Complexity",
  stakeholder_priority: "Stakeholder Priority",
  resource_availability: "Resource Availability",
  architecture_impact: "Architecture Impact",
  dependency_depth: "Dependency Depth",
  revenue_roi: "Revenue ROI",
};

const NUMERIC_LABELS = {
  new_screens: "New UI Screens",
  external_integrations: "External Integrations",
  db_schema_changes: "DB Schema Changes",
  logic_rules: "Business Logic Rules",
};

export default function NewChangeClient({
  activeBaseline,
  modules,
  projectId,
  user,
}) {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [liveScore, setLiveScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sliders, setSliders] = useState({
    technical_complexity: 5,
    stakeholder_priority: 5,
    resource_availability: 5,
    architecture_impact: 5,
    dependency_depth: 5,
    revenue_roi: 5,
  });

  const [numerics, setNumerics] = useState({
    new_screens: 0,
    external_integrations: 0,
    db_schema_changes: 0,
    logic_rules: 0,
  });

  // Calculate live score
  useEffect(() => {
    let score = 0;

    Object.keys(sliders).forEach((key) => {
      score += sliders[key] * 10 * SCORING_WEIGHTS.sliders[key];
    });

    Object.keys(numerics).forEach((key) => {
      const severity = Math.min(numerics[key], 10);
      score += severity * 10 * SCORING_WEIGHTS.numerics[key];
    });

    setLiveScore(Math.round(score));
  }, [sliders, numerics]);

  const handleSliderChange = (key, value) => {
    setSliders((prev) => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleNumericChange = (key, increment) => {
    setNumerics((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + increment),
    }));
  };

  const getScoreColor = (score) => {
    if (score < 30)
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
      };
    if (score < 70)
      return { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
    return { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
  };

  const getScoreLabel = (score) => {
    if (score < 30) return { label: "Low Impact", color: "emerald" };
    if (score < 70) return { label: "Medium Impact", color: "amber" };
    return { label: "High Impact", color: "rose" };
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));

    // TODO: Call server action to save change
    // const result = await submitChangeRequest({ ... });

    setIsSubmitting(false);
    // For now, redirect to impacts
    router.push(`/${user}/${projectId}/impacts`);
  }

  const scoreInfo = getScoreLabel(liveScore);
  const colors = getScoreColor(liveScore);

  const canSubmit = selectedModule && title;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Change Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Module *
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="">Select a module...</option>
                    {modules?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.moduleId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Change Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Integrate Stripe Payment Gateway"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the change in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Risk Assessment (1-10)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(sliders).map(([key, value]) => {
                  const weight = SCORING_WEIGHTS.sliders[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {SLIDER_LABELS[key]}
                        </label>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {value}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) =>
                          handleSliderChange(key, e.target.value)
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-blue-600"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Weight: {(weight * 100).toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Deltas Section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Technical Changes
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(numerics).map(([key, value]) => {
                  const weight = SCORING_WEIGHTS.numerics[key];
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {NUMERIC_LABELS[key]}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Weight: {(weight * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleNumericChange(key, -1)}
                          className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium">
                          −
                        </button>
                        <span className="flex-1 text-center font-bold text-slate-900 dark:text-white text-lg">
                          {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNumericChange(key, 1)}
                          className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium">
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Score Widget */}
          <div>
            <motion.div
              className="sticky top-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 text-center">
                Impact Prediction
              </h3>

              {/* Score Gauge */}
              <div className="mb-6">
                <svg viewBox="0 0 100 60" className="w-full h-32">
                  {/* Background arc */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  {/* Score arc */}
                  <motion.path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className={colors.text}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: liveScore / 100 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  {/* Score text */}
                  <text
                    x="50"
                    y="35"
                    textAnchor="middle"
                    className="text-4xl font-bold fill-slate-900 dark:fill-white">
                    {liveScore}
                  </text>
                </svg>
              </div>

              {/* Status Badge */}
              <div
                className={`p-3 rounded-lg text-center mb-6 ${
                  scoreInfo.color === "emerald"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : scoreInfo.color === "amber"
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "bg-rose-50 dark:bg-rose-900/20"
                }`}>
                <p
                  className={`text-sm font-semibold ${
                    scoreInfo.color === "emerald"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : scoreInfo.color === "amber"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-rose-700 dark:text-rose-400"
                  }`}>
                  {scoreInfo.label}
                </p>
              </div>

              {/* Warning/Info Box */}
              {liveScore > 70 ? (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 mb-6">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Critical impact. Likely exceeds budget tolerance.
                    </p>
                  </div>
                </div>
              ) : liveScore > 30 ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
                  <div className="flex gap-2">
                    <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Moderate impact. Review carefully before approval.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-6">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Low impact. Safe to proceed with standard QA.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  !canSubmit || isSubmitting
                    ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                }`}>
                <TrendingUp className="w-4 h-4" />
                {isSubmitting ? "Analyzing..." : "Analyze Impact"}
              </button>

              <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-3">
                Baseline:{" "}
                <span className="font-mono">
                  {activeBaseline?.versionLabel || "v1.0"}
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
