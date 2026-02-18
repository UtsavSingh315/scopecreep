export default async function SettingsPage({ params }) {
  const { user } = await params;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-blue-100">
          Settings
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-blue-300 mt-2">
          Manage your account settings
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4 md:p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-blue-50 mb-4">
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-blue-50">
                    Email Notifications
                  </p>
                  <p className="text-sm text-slate-600 dark:text-blue-300">
                    Receive email updates about your projects
                  </p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-blue-50">
                    Dark Mode
                  </p>
                  <p className="text-sm text-slate-600 dark:text-blue-300">
                    Toggle dark mode appearance
                  </p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
