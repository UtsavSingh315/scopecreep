import Link from "next/link";

export default async function ChangeComparePage({ params }) {
  const { user, projectId, changeId } = await params;

  // placeholder mocked data
  const change = { id: changeId, score: 62, title: "Add payment gateway" };
  const baseline = { id: "BX0003", score: 28, title: "Active baseline" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Compare: {change.id} ↔ {baseline.id}
          </h1>
          <p className="text-sm text-slate-600">Project: {projectId}</p>
        </div>
        <div>
          <Link href={`..`} className="text-sm text-blue-400">
            Back to report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded p-4 border">
          <h3 className="text-sm font-semibold">Change</h3>
          <div className="mt-2">{change.title}</div>
          <div className="mt-3 text-sm">
            Score: <strong>{change.score}%</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded p-4 border">
          <h3 className="text-sm font-semibold">Active Baseline</h3>
          <div className="mt-2">{baseline.title}</div>
          <div className="mt-3 text-sm">
            Score: <strong>{baseline.score}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
