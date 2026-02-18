"use client";

import { useState } from "react";
import { DataTable } from "@/app/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp } from "lucide-react";

const sampleBaselines = [
  {
    id: "baseline-001",
    name: "Initial Project Scope",
    version: "v1.0",
    createdAt: "2024-01-15",
    description: "Initial baseline with core features",
    features: ["User authentication", "Dashboard", "Basic reporting"],
  },
  {
    id: "baseline-002",
    name: "Phase 2 Requirements",
    version: "v2.0",
    createdAt: "2024-02-20",
    description: "Added advanced features",
    features: [
      "Advanced analytics",
      "Export functionality",
      "User roles & permissions",
    ],
  },
  {
    id: "baseline-003",
    name: "API Integration",
    version: "v2.1",
    createdAt: "2024-03-10",
    description: "Third-party API integrations",
    features: [
      "Payment gateway integration",
      "Email service integration",
      "Cloud storage integration",
    ],
  },
];

function BaselineDetailsDialog({ baseline }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{baseline.name}</DialogTitle>
          <DialogDescription>
            Version: {baseline.version} | Created: {baseline.createdAt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-blue-50 mb-2">
              Description
            </h4>
            <p className="text-slate-600 dark:text-blue-300">
              {baseline.description}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-blue-50 mb-2">
              Features
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {baseline.features.map((feature, index) => (
                <li key={index} className="text-slate-600 dark:text-blue-300">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpandableRow({ baseline }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-blue-50 dark:hover:bg-slate-700">
        <td className="p-2 md:p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </td>
        <td className="p-2 md:p-4 font-medium text-xs md:text-sm">
          {baseline.id}
        </td>
        <td className="p-2 md:p-4 text-xs md:text-sm">{baseline.name}</td>
        <td className="p-2 md:p-4 text-xs md:text-sm">{baseline.version}</td>
        <td className="p-2 md:p-4 text-xs md:text-sm">{baseline.createdAt}</td>
        <td className="p-2 md:p-4">
          <BaselineDetailsDialog baseline={baseline} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-blue-50 dark:bg-slate-700">
          <td colSpan="6" className="p-2 md:p-4">
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-blue-50">
                {baseline.description}
              </p>
              <div className="text-xs md:text-sm text-slate-600 dark:text-blue-300">
                <p className="font-medium mb-1">Features:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 md:ml-4">
                  {baseline.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
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
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-blue-100">
          Baselines
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-blue-300 mt-2">
          View and manage project baselines
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden shadow-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-blue-100 dark:bg-slate-700">
            <tr>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50 w-12"></th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                ID
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Name
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Version
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Created At
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleBaselines.map((baseline) => (
              <ExpandableRow key={baseline.id} baseline={baseline} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
