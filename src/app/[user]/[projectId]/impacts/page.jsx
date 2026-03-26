import { getProjectChanges, getProjectConfig, getProject } from "@/lib/actions/projects";
import ImpactsClient from "./ImpactsClient";

export default async function ImpactsPage({ params }) {
  const { user, projectId } = await params;

  // Fetch project data to get total budget
  const projectResult = await getProject(projectId);
  const project = projectResult.error ? null : projectResult.data;
  const totalBudget = project?.totalBudget || 100000;

  // Fetch changes and their data from database
  const changesResult = await getProjectChanges(projectId);
  const changes = changesResult.error ? [] : changesResult.data || [];
  const changesError = changesResult.error;

  // Fetch project config for tolerance
  const configResult = await getProjectConfig(projectId);
  const config = configResult.error ? null : configResult.data;
  const budgetTolerancePct = config?.budgetTolerancePct || 0.15;

  // Serialize dates to strings
  const serializedChanges = changes.map((change) => ({
    ...change,
    createdAt: change.createdAt
      ? new Date(change.createdAt).toISOString().split("T")[0]
      : null,
    updatedAt: change.updatedAt
      ? new Date(change.updatedAt).toISOString().split("T")[0]
      : null,
  }));

  return (
    <ImpactsClient
      impacts={serializedChanges}
      error={changesError}
      user={user}
      projectId={projectId}
      budgetTolerancePct={budgetTolerancePct}
      totalBudget={totalBudget}
    />
  );
}
