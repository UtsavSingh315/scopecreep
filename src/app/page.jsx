import Image from "next/image";
import { DataTable } from "./data-table";
import { Columns } from "./columns";

const testUiRoutes = [
  { id: "1", route: "/login", info: "User login page" },
  { id: "2", route: "/signup", info: "User sign up page" },
  { id: "3", route: "/testuser/profile", info: "User profile page" },
  { id: "4", route: "/testuser/settings", info: "User settings page" },
  { id: "5", route: "/testuser/my-projects", info: "My projects listing" },
  { id: "6", route: "/testuser/proj-001", info: "Project dashboard" },
  { id: "7", route: "/testuser/proj-001/baselines", info: "Project baselines" },
  { id: "8", route: "/testuser/proj-001/changes", info: "Project changes" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 min-h-screen items-center justify-center bg-blue-50 dark:bg-slate-900 font-sans px-4">
      <div className="flex flex-col justify-center p-4 md:p-6 bg-blue-900 dark:bg-blue-950 h-auto w-full max-w-[90vw] md:w-[80vw] lg:w-[70vw] rounded-lg shadow-lg">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-mono font-bold text-blue-50">
          Scope-Creep Analyser
        </h1>
      </div>
      <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-10 justify-center w-full max-w-[90vw] md:w-[80vw] lg:w-[70vw]">
        <div className="w-16 sm:w-20 aspect-square bg-blue-300 dark:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
        <div className="w-16 sm:w-20 aspect-square bg-blue-300 dark:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
        <div className="w-16 sm:w-20 aspect-square bg-blue-300 dark:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
        <div className="w-16 sm:w-20 aspect-square bg-blue-300 dark:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
        <div className="w-16 sm:w-20 aspect-square bg-blue-300 dark:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"></div>
      </div>
      <div className="w-full max-w-[90vw] md:w-[80vw] lg:w-[70vw] overflow-x-auto">
        <DataTable columns={Columns} data={testUiRoutes} />
      </div>
    </div>
  );
}

// /Login
// /[user]/Profile
// /[user]/Settings
// /[user]/My projects -> new project
// /[user]/[Project id] (project dashboard hoga yeh)
// /[user]/[Project id]/baselines
// /[user]/[Project id]/changes
