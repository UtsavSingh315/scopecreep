import Link from "next/link";
import NewChangeClient from "./NewChangeClient";
import { ArrowLeft } from "lucide-react";

export default async function NewChangePage({ params }) {
  const { user, projectId } = await params;

  // Mock active baseline
  const activeBaseline = { id: "baseline-001", versionLabel: "v1.0" };

  // Mock modules from proj-001
  const modules = [
    {
      id: 1,
      name: "Authentication & Authorization",
      moduleId: "M-Auth",
      techStack: "Next.js, JWT, bcrypt",
    },
    {
      id: 2,
      name: "Payment Gateway Integration",
      moduleId: "M-Pay",
      techStack: "Stripe, Node.js, Webhook",
    },
    {
      id: 3,
      name: "Analytics Dashboard",
      moduleId: "M-Analytics",
      techStack: "React, D3.js, PostgreSQL",
    },
    {
      id: 4,
      name: "Data Export Engine",
      moduleId: "M-Export",
      techStack: "Node.js, Excel.js, Queue",
    },
    {
      id: 5,
      name: "Email Notification Service",
      moduleId: "M-Email",
      techStack: "SendGrid, Node.js, Queue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create New Change
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Propose a change and analyze its impact on project timeline and
            budget
          </p>
        </div>
        <Link
          href={`/${user}/${projectId}/changes`}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <NewChangeClient
        activeBaseline={activeBaseline}
        modules={modules}
        projectId={projectId}
        user={user}
      />
    </div>
  );
}
