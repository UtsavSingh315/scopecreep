import Link from "next/link";
import NewChangeClient from "./NewChangeClient";
import { ArrowLeft } from "lucide-react";
import { getProjectModulesForImpact } from "@/lib/actions/projects";
import { initDb } from "@/db/index";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export default async function NewChangePage({ params }) {
  const { user, projectId } = await params;

  // Fetch modules with impact/dependent relationships for the change form
  const modulesResult = await getProjectModulesForImpact(projectId);
  const modules = modulesResult.error ? [] : modulesResult.data || [];

  // Fetch the active baseline for this project
  let activeBaseline = null;
  try {
    const conn = await initDb();
    if (conn) {
      const project = await conn.query.projects.findFirst({
        where: eq(schema.projects.customId, projectId),
      });

      if (project) {
        const baseline = await conn.query.baselines.findFirst({
          where: eq(schema.baselines.projectId, project.id),
          orderBy: (baselines, { desc }) => [desc(baselines.id)],
        });

        if (baseline) {
          activeBaseline = {
            id: baseline.id,
            versionLabel: baseline.versionLabel,
          };
        }
      }
    }
  } catch (err) {
    console.error("Error fetching baseline:", err);
    // Continue without baseline if fetch fails
  }

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
