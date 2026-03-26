import { getUserByUsername } from "@/lib/actions/projects";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({ params }) {
  const { user: username } = await params;

  // Fetch real user data from database
  const userResult = await getUserByUsername(username);
  const user = userResult.success ? userResult.data : null;
  const userError = userResult.error;

  if (userError || !user) {
    return (
      <div className="space-y-6">
        <Link
          href={`/${username}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
          <p className="text-red-800 dark:text-red-200">
            {userError || "User not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Profile
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2">
          Your profile information
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-white mt-1 font-semibold">
              {user.fullName || "Not set"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Username
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-white mt-1">
              @{user.username}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-white mt-1">
              {user.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-white mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {user.role || "User"}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Account Status
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-white mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400"
                }`}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
