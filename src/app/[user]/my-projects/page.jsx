// Server component - no "use client", safe to import server-only modules
import { cookies } from "next/headers";
import ProjectsClient from "./ProjectsClient";
import { getUserProjects } from "@/lib/actions/projects";

export default async function MyProjectsPage({ params }) {
  const { user } = params;

  // Get user ID from session cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let projects = [];
  let error = null;

  if (userId) {
    // Fetch real projects from database
    const result = await getUserProjects(parseInt(userId));
    if (result.error) {
      error = result.error;
      console.error("Failed to fetch projects:", error);
    } else {
      projects = result.data || [];
    }
  }

  return (
    <ProjectsClient initialProjects={projects} user={user} error={error} />
  );
}
