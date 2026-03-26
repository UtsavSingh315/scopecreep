// Server component - no "use client", safe to import server-only modules
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient";
import { getUserProjects } from "@/lib/actions/projects";

export default async function MyProjectsPage({ params }) {
  const { user } = await params;

  // Get user ID and username from session cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const sessionUsername = cookieStore.get("username")?.value;

  // Verify the URL user matches the session username
  if (sessionUsername && sessionUsername !== user) {
    redirect(`/${sessionUsername}/my-projects`);
  }

  let projects = [];
  let error = null;

  if (userId) {
    // Fetch real projects for THIS user only
    const result = await getUserProjects(parseInt(userId));
    if (result.error) {
      error = result.error;
      console.error("Failed to fetch projects:", error);
    } else {
      // Serialize Date objects to strings
      projects = (result.data || []).map((p) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : null,
      }));
    }
  }

  return (
    <ProjectsClient 
      initialProjects={projects} 
      user={user} 
      userId={userId}
      error={error} 
    />
  );
}
