// Server component - no "use client", safe to import server-only modules
import ProjectsClient from "./ProjectsClient";

// Mock projects for development (real DB wiring via server action if needed)
const mockProjects = [
  {
    id: "1",
    customId: "PX0001",
    name: "proj-001",
    description: "Demo project",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    customId: "PX0002",
    name: "proj-002",
    description: "Test project",
    status: "inactive",
    createdAt: "2024-02-20",
  },
];

export default async function MyProjectsPage({ params }) {
  const { user } = params;

  // Use mock data for now (can integrate dbClient for real persistence later)
  const projects = mockProjects;

  return <ProjectsClient initialProjects={projects} user={user} />;
}
