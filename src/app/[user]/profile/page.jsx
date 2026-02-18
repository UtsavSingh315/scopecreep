export default async function ProfilePage({ params }) {
  const { user } = await params;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-blue-100">
          Profile
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-blue-300 mt-2">
          Manage your profile information
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-blue-200">
              Username
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-blue-50 mt-1">
              @{user}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-blue-200">
              Email
            </label>
            <p className="text-base md:text-lg text-slate-900 dark:text-blue-50 mt-1">
              {user}@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
