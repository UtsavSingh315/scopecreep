"use client";

import { useState } from "react";
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

const sampleChanges = [
  {
    id: "change-001",
    title: "Add payment gateway",
    type: "Feature Addition",
    priority: "High",
    status: "Approved",
    requestedBy: "John Doe",
    requestedAt: "2024-02-15",
    description: "Integrate Stripe payment gateway for processing payments",
    impact: "Requires backend API changes and frontend UI updates",
    estimatedHours: 40,
  },
  {
    id: "change-002",
    title: "Update user dashboard",
    type: "Enhancement",
    priority: "Medium",
    status: "In Review",
    requestedBy: "Jane Smith",
    requestedAt: "2024-02-18",
    description: "Redesign user dashboard with new metrics and charts",
    impact: "UI/UX changes only, no backend modifications",
    estimatedHours: 24,
  },
  {
    id: "change-003",
    title: "Fix login bug",
    type: "Bug Fix",
    priority: "Critical",
    status: "Completed",
    requestedBy: "Mike Johnson",
    requestedAt: "2024-02-10",
    description: "Fix authentication issue preventing users from logging in",
    impact: "Backend security fix, no UI changes",
    estimatedHours: 8,
  },
];

function ChangeDetailsDialog({ change }) {
  const statusColors = {
    Approved:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "In Review":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const priorityColors = {
    Critical: "text-red-600 dark:text-red-400",
    High: "text-orange-600 dark:text-orange-400",
    Medium: "text-yellow-600 dark:text-yellow-400",
    Low: "text-green-600 dark:text-green-400",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{change.title}</DialogTitle>
          <DialogDescription>
            {change.id} | Requested by {change.requestedBy} on{" "}
            {change.requestedAt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-4">
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-blue-300">
                Status:
              </span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[change.status]}`}>
                {change.status}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-blue-300">
                Priority:
              </span>
              <span
                className={`ml-2 font-semibold ${priorityColors[change.priority]}`}>
                {change.priority}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-blue-300">
                Type:
              </span>
              <span className="ml-2 text-slate-900 dark:text-blue-50">
                {change.type}
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-blue-50 mb-2">
              Description
            </h4>
            <p className="text-slate-600 dark:text-blue-300">
              {change.description}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-blue-50 mb-2">
              Impact Analysis
            </h4>
            <p className="text-slate-600 dark:text-blue-300">{change.impact}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-blue-50 mb-2">
              Estimated Hours
            </h4>
            <p className="text-slate-600 dark:text-blue-300">
              {change.estimatedHours} hours
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpandableRow({ change }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    Approved:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "In Review":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const priorityColors = {
    Critical: "text-red-600 dark:text-red-400 font-bold",
    High: "text-orange-600 dark:text-orange-400 font-semibold",
    Medium: "text-yellow-600 dark:text-yellow-400",
    Low: "text-green-600 dark:text-green-400",
  };

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
          {change.id}
        </td>
        <td className="p-2 md:p-4 text-xs md:text-sm">{change.title}</td>
        <td className="p-2 md:p-4 text-xs md:text-sm">{change.type}</td>
        <td className="p-2 md:p-4">
          <span
            className={`${priorityColors[change.priority]} text-xs md:text-sm`}>
            {change.priority}
          </span>
        </td>
        <td className="p-2 md:p-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[change.status]}`}>
            {change.status}
          </span>
        </td>
        <td className="p-2 md:p-4">
          <ChangeDetailsDialog change={change} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-blue-50 dark:bg-slate-700">
          <td colSpan="7" className="p-2 md:p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-blue-50 mb-1">
                  Description:
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-blue-300">
                  {change.description}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-blue-50 mb-1">
                  Impact:
                </p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-blue-300">
                  {change.impact}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 text-xs md:text-sm">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-blue-50">
                    Requested by:
                  </span>
                  <span className="ml-2 text-slate-600 dark:text-blue-300">
                    {change.requestedBy}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-blue-50">
                    Date:
                  </span>
                  <span className="ml-2 text-slate-600 dark:text-blue-300">
                    {change.requestedAt}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-blue-50">
                    Estimated:
                  </span>
                  <span className="ml-2 text-slate-600 dark:text-blue-300">
                    {change.estimatedHours}h
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ChangesPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-blue-100">
          Changes
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-blue-300 mt-2">
          Track and manage project changes
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden shadow-lg overflow-x-auto">
        <table className="w-full min-w-150">
          <thead className="bg-blue-100 dark:bg-slate-700">
            <tr>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50 w-12"></th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                ID
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Title
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Type
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Priority
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Status
              </th>
              <th className="p-2 md:p-4 text-left text-xs md:text-sm font-medium text-slate-900 dark:text-blue-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleChanges.map((change) => (
              <ExpandableRow key={change.id} change={change} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
