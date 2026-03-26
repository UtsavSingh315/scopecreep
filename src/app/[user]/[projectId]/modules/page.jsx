import ModulesClient from "./client";

export default async function ModulesPage({ params }) {
  const { user, projectId } = params;

  // Mock modules for proj-001
  const mockModules = [
    {
      id: 1,
      name: "Authentication & Authorization",
      moduleId: "M-Auth",
      techStack: "Next.js, JWT, bcrypt",
      projectId,
      complexity: "Medium",
      description: "User login, registration, session management",
      dependencies: [],
      estimatedDays: 15,
    },
    {
      id: 2,
      name: "Payment Gateway Integration",
      moduleId: "M-Pay",
      techStack: "Stripe, Node.js, Webhook",
      projectId,
      complexity: "High",
      description: "Payment processing, subscription management, invoicing",
      dependencies: [1],
      estimatedDays: 20,
    },
    {
      id: 3,
      name: "Analytics Dashboard",
      moduleId: "M-Analytics",
      techStack: "React, D3.js, PostgreSQL",
      projectId,
      complexity: "High",
      description: "Real-time metrics, charts, export functionality",
      dependencies: [1],
      estimatedDays: 25,
    },
    {
      id: 4,
      name: "Data Export Engine",
      moduleId: "M-Export",
      techStack: "Node.js, Excel.js, Queue",
      projectId,
      complexity: "Medium",
      description: "CSV, Excel, PDF export with async processing",
      dependencies: [3],
      estimatedDays: 12,
    },
    {
      id: 5,
      name: "Email Notification Service",
      moduleId: "M-Email",
      techStack: "SendGrid, Node.js, Queue",
      projectId,
      complexity: "Low",
      description: "Transactional emails, templates, delivery tracking",
      dependencies: [1],
      estimatedDays: 8,
    },
  ];

  let modules = mockModules;

  try {
    const db = await import("@/lib/dbClient");
    const dbModules = await db.getModules?.(projectId);
    if (dbModules && dbModules.length > 0) {
      modules = dbModules;
    }
  } catch {
    // Use mock data on error
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Architecture Modules
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Organize your system into logical modules and track dependencies
        </p>
      </div>

      <ModulesClient
        initialModules={modules}
        projectId={projectId}
        user={user}
      />
    </div>
  );
}
