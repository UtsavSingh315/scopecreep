"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Calendar, Package } from "lucide-react";

const mockBaselines = [
  {
    id: "baseline-001",
    name: "Initial Project Scope v1.0",
    version: "1.0",
    createdAt: "2024-01-15",
    description: "Core platform foundation with essential features",
    estimatedCost: 45000,
    estimatedDuration: 180,
    modules: [
      { id: "M-Auth", name: "Authentication", complexity: "Medium" },
      { id: "M-API", name: "REST API", complexity: "High" },
      { id: "M-DB", name: "Database Layer", complexity: "High" },
    ],
    features: ["User authentication", "Dashboard", "Basic reporting"],
    risks: ["Limited scalability", "No caching layer"],
  },
  {
    id: "baseline-002",
    name: "Phase 2 Requirements v1.1",
    version: "1.1",
    createdAt: "2024-02-20",
    description: "Added advanced analytics and permission system",
    estimatedCost: 62000,
    estimatedDuration: 240,
    modules: [
      { id: "M-Auth", name: "Authentication", complexity: "Medium" },
      { id: "M-API", name: "REST API", complexity: "High" },
      { id: "M-DB", name: "Database Layer", complexity: "High" },
      { id: "M-Analytics", name: "Analytics Engine", complexity: "High" },
    ],
    features: [
      "Advanced analytics",
      "Export functionality",
      "User roles & permissions",
    ],
    risks: ["Database migration complexity", "Performance tuning needed"],
  },
  {
    id: "baseline-003",
    name: "API Integration v1.2",
    version: "1.2",
    createdAt: "2024-03-10",
    description: "Third-party integrations and payment processing",
    estimatedCost: 78000,
    estimatedDuration: 300,
    modules: [
      { id: "M-Auth", name: "Authentication", complexity: "Medium" },
      { id: "M-API", name: "REST API", complexity: "High" },
      { id: "M-DB", name: "Database Layer", complexity: "High" },
      { id: "M-Analytics", name: "Analytics Engine", complexity: "High" },
      { id: "M-Payment", name: "Payment Gateway", complexity: "Critical" },
    ],
    features: [
      "Payment gateway integration",
      "Email service integration",
      "Cloud storage integration",
    ],
    risks: ["PCI compliance", "Third-party API dependency"],
  },
];

function BaselineDetailsDialog({ baseline }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
          View Details
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{baseline.name}</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Version {baseline.version} • Created {baseline.createdAt}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Estimated Cost
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${(baseline.estimatedCost / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Duration
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {baseline.estimatedDuration}d
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Modules
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {baseline.modules.length}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
              Description
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {baseline.description}
            </p>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              Included Modules
            </h4>
            <div className="space-y-2">
              {baseline.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {mod.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {mod.id}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      mod.complexity === "Critical"
                        ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                        : mod.complexity === "High"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    }`}>
                    {mod.complexity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
              Features
            </h4>
            <ul className="space-y-1">
              {baseline.features.map((feature, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
              Known Risks
            </h4>
            <ul className="space-y-1">
              {baseline.risks.map((risk, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpandableBaselineRow({ baseline }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td className="p-3 pl-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </td>
        <td className="p-3 font-mono text-sm text-slate-600 dark:text-slate-400">
          {baseline.id}
        </td>
        <td className="p-3">
          <div className="font-semibold text-slate-900 dark:text-white">
            {baseline.name}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {baseline.description}
          </div>
        </td>
        <td className="p-3">
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {baseline.version}
          </div>
        </td>
        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
          {baseline.createdAt}
        </td>
        <td className="p-3 text-right">
          <BaselineDetailsDialog baseline={baseline} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50 dark:bg-slate-800/50">
          <td colSpan="6" className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Estimated Cost
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    ${(baseline.estimatedCost / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Duration
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {baseline.estimatedDuration} days
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Modules
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {baseline.modules.length}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
                  Modules ({baseline.modules.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {baseline.modules.map((mod) => (
                    <span
                      key={mod.id}
                      className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                      {mod.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function BaselinesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Baselines
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Project snapshots representing confirmed scope at key milestones
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 pl-4 text-left w-10"></th>
                <th className="p-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  ID
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Baseline
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Version
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Created
                </th>
                <th className="p-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockBaselines.map((baseline) => (
                <ExpandableBaselineRow key={baseline.id} baseline={baseline} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Baselines</strong> represent validated project scopes at
          specific points in time. Use them to compare current proposed changes
          against the baseline and track scope creep.
        </p>
      </div>
    </div>
  );
}
