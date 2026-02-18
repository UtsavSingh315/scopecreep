"use client";

import { Sidebar } from "@/components/Sidebar";
import { useParams } from "next/navigation";

export default function UserLayout({ children }) {
  const params = useParams();
  const user = params.user;
  const projectId = params.projectId;

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-slate-900">
      <Sidebar user={user} projectId={projectId} />
      {/* Main content with top padding on mobile for fixed header */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
