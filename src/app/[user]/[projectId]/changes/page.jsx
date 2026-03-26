import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";

// Mock changes data
const mockChanges = [
  {
    id: "change-001",
    title: "Add payment gateway integration",
    description: "Integrate Stripe for payment processing",
    type: "Feature Addition",
    priority: "High",
    status: "Approved",
    createdAt: "2024-03-15",
    impact: 72,
  },
  {
    id: "change-002",
    title: "Database schema optimization",
    description: "Add indexes and normalize tables",
    type: "Performance",
    priority: "Medium",
    status: "Pending",
    createdAt: "2024-03-10",
    impact: 45,
  },
  {
    id: "change-003",
    title: "Mobile responsive design",
    description: "Implement responsive layouts for mobile devices",
    type: "UI/UX Enhancement",
    priority: "High",
    status: "In Progress",
    createdAt: "2024-03-05",
    impact: 58,
  },
];

function ImpactBadge({ score }) {
  if (score < 30)
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
        Low
      </span>
    );
  if (score < 70)
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        Medium
      </span>
    );
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
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
      className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}

export default async function ChangesPage({ params }) {
  const { user, projectId } = await params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Changes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Proposed changes and their impact analysis
          </p>
        </div>
        <Link
          href={`/${user}/${projectId}/changes/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Change
        </Link>
      </div>

      {/* Changes List */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800">
        {mockChanges.length === 0 ? (
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
                    Type
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Priority
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
                {mockChanges.map((change) => (
                  <tr
                    key={change.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-300">
                      {change.id}
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
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      {change.type}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          change.priority === "High"
                            ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                            : change.priority === "Medium"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        }`}>
                        {change.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={change.status} />
                    </td>
                    <td className="p-4">
                      <ImpactBadge score={change.impact} />
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/${user}/${projectId}/changes/${change.id}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>Changes</strong> are proposed modifications to your project
          scope. Each change is analyzed for impact on timeline, budget, and
          architecture.
        </p>
      </div>
    </div>
  );
}
