"use client";

import { DataTable } from "@/app/data-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const projectColumns = [
  {
    accessorKey: "id",
    header: "Project ID",
  },
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => {
      const projectId = row.getValue("id");
      const projectName = row.getValue("name");
      return projectName;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const statusColors = {
        active:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        inactive:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        archived: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || ""}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const projectId = row.getValue("id");
      return (
        <Link href={`#`}>
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
      );
    },
  },
];

// Sample data
const sampleProjects = [
  {
    id: "proj-001",
    name: "E-commerce Platform",
    description: "Full-stack e-commerce solution",
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "proj-002",
    name: "Mobile Banking App",
    description: "iOS and Android banking application",
    createdAt: "2024-02-20",
    status: "active",
  },
  {
    id: "proj-003",
    name: "Analytics Dashboard",
    description: "Real-time analytics and reporting",
    createdAt: "2023-12-10",
    status: "inactive",
  },
];

export default function MyProjectsPage() {
  const params = useParams();
  const user = params.user;

  // Update the View button link to use actual user and projectId
  const columnsWithLinks = projectColumns.map((col) => {
    if (col.accessorKey === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          const projectId = row.getValue("id");
          return (
            <Link href={`/${user}/${projectId}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          );
        },
      };
    }
    return col;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-blue-100">
            My Projects
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-blue-300 mt-2">
            Manage and track all your projects
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg overflow-x-auto">
        <DataTable columns={columnsWithLinks} data={sampleProjects} />
      </div>
    </div>
  );
}
