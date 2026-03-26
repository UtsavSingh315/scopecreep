"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  GitMerge,
  Layout,
  AlertTriangle,
  CheckCircle,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitChangeRequest } from "@/lib/actions/changes";

// The Exact JSON Weights you provided
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

export default function ChangeRequestForm({
  projectId,
  activeBaseline,
  modules,
}) {
  const router = useRouter();
  // --- STATE MANAGEMENT ---
  const [selectedModule, setSelectedModule] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Sliders default to 1 (Low Risk)
  const [sliders, setSliders] = useState({
    technical_complexity: 1,
    stakeholder_priority: 1,
    resource_availability: 1,
    architecture_impact: 1,
    dependency_depth: 1,
    revenue_roi: 1,
  });

  // Numerics default to 0
  const [numerics, setNumerics] = useState({
    new_screens: 0,
    external_integrations: 0,
    db_schema_changes: 0,
    logic_rules: 0,
  });

  const [liveScore, setLiveScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LIVE MATH ENGINE ---
  useEffect(() => {
    let score = 0;

    // Calculate Sliders (Value 1-10 * 10 to normalize to 100 * Weight)
    // Max possible slider score = 60
    Object.keys(sliders).forEach((key) => {
      score += sliders[key] * 10 * SCORING_WEIGHTS.sliders[key];
    });

    // Calculate Numerics (Assume 10 units = max severity for standard PR)
    // Max possible numeric score = 40
    Object.keys(numerics).forEach((key) => {
      const severity = Math.min(numerics[key], 10); // Cap at 10 for gauge math
      score += severity * 10 * SCORING_WEIGHTS.numerics[key];
    });

    setLiveScore(Math.round(score));
  }, [sliders, numerics]);

  // --- HANDLers ---
  const handleSliderChange = (key, value) => {
    setSliders((prev) => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleNumericChange = (key, increment) => {
    setNumerics((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + increment), // Prevent negative numbers
    }));
  };

  // UI Helpers
  const getScoreColor = (score) => {
    if (score < 30) return "text-emerald-400";
    if (score < 70) return "text-amber-400";
    return "text-rose-500";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-slate-200">
      {/* HEADER: Linkage Proof */}
      <div className="mb-8 flex justify-between items-end border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            New Change Request
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Benchmarking against Active Baseline:{" "}
            <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              {activeBaseline?.versionLabel || "v1.0"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Form Inputs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Narrative & Target */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" /> Core Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">
                  Target Module (Required)
                </label>
                <select
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  required>
                  <option value="">-- Select Primary Module --</option>
                  {modules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.techStack})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">
                  Request Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Integrate Stripe Checkout"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Subjective Sliders (60% Weight) */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Risk Assessment
              (1-10)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(SCORING_WEIGHTS.sliders).map(([key, weight]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="capitalize font-medium text-slate-300">
                      {key.replace("_", " ")}
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      Weight: {weight * 100}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sliders[key]}
                      onChange={(e) => handleSliderChange(key, e.target.value)}
                      className="w-full accent-indigo-500"
                    />
                    <span
                      className="text-xs font-bold w-4 text-right"
                      style={{ color: getScoreColor(sliders[key] * 10) }}>
                      {sliders[key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Objective Numerics (40% Weight) */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" /> Technical Deltas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(SCORING_WEIGHTS.numerics).map(([key, weight]) => (
                <div
                  key={key}
                  className="bg-slate-900/40 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="capitalize text-sm font-medium text-slate-300">
                      {key.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-slate-500">
                      Weight: {weight * 100}%
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                    <button
                      type="button"
                      onClick={() => handleNumericChange(key, -1)}
                      className="px-3 py-1 hover:bg-slate-700 transition-colors">
                      -
                    </button>
                    <span className="px-3 py-1 font-mono min-w-10 text-center bg-slate-900">
                      {numerics[key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNumericChange(key, 1)}
                      className="px-3 py-1 hover:bg-slate-700 transition-colors">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Live Analyzer & Submission */}
        <div className="space-y-6">
          {/* Sticky Widget */}
          <motion.div
            className="sticky top-6 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

            <h3 className="text-lg font-bold text-white mb-6 text-center">
              Live Impact Prediction
            </h3>

            {/* The Gauge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-48 h-48 rounded-full border-12 border-slate-800">
                <motion.svg
                  className="absolute top-0 left-0 w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className={`${getScoreColor(liveScore)} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                    strokeDasharray="276.46" // 2 * pi * 44
                    strokeDashoffset={276.46 - (276.46 * liveScore) / 100}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </motion.svg>
                <div className="text-center">
                  <div
                    className={`text-5xl font-black ${getScoreColor(liveScore)}`}>
                    {liveScore}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">
                    Score
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Context */}
            {liveScore > 70 ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Critical impact projected. This will likely exceed budget
                  tolerances and require Admin override.
                </p>
              </div>
            ) : liveScore > 30 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300 flex items-start gap-3">
                <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Moderate impact. Review logic rules and schema changes
                  closely.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-300 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Low risk change. Safe to proceed with standard QA.</p>
              </div>
            )}

            <button
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-1 ${
                !selectedModule || !title
                  ? "bg-slate-700 cursor-not-allowed opacity-50"
                  : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25"
              }`}
              disabled={!selectedModule || !title || isSubmitting}
              onClick={async () => {
                if (!selectedModule || !title || isSubmitting) return;
                setIsSubmitting(true);
                try {
                  const payload = {
                    projectId,
                    primaryModuleId: selectedModule,
                    benchmarkBaselineId: activeBaseline?.id ?? null,
                    sliders,
                    numerics,
                    liveScore,
                    title,
                    description,
                  };

                  // call server action
                  const res = await submitChangeRequest(payload);

                  // res contains { changeRequest, impactResult }
                  const changeId =
                    res?.changeRequest?.customId || res?.changeRequest?.id;
                  if (changeId) {
                    // route to the verdict page using customId if available, else id
                    const idForRoute = res.changeRequest.customId
                      ? res.changeRequest.customId
                      : res.changeRequest.id;
                    // push to /[user]/[projectId]/changes/[changeId]
                    // derive user from URL safely
                    const parts = window.location.pathname
                      .split("/")
                      .filter(Boolean);
                    const user = parts[0] || "";
                    router.push(`/${user}/${projectId}/changes/${idForRoute}`);
                  } else {
                    // fallback: refresh or show error
                    alert("Change created but no id returned.");
                  }
                } catch (err) {
                  console.error(err);
                  alert("Failed to submit change: " + String(err));
                } finally {
                  setIsSubmitting(false);
                }
              }}>
              {!selectedModule
                ? "Select Module First"
                : isSubmitting
                  ? "Analyzing..."
                  : "Generate Official Impact"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
