"use client";

import { useRouter } from "next/navigation";
import { LogOut, Lock } from "lucide-react";
import { useState } from "react";

export default function SettingsPage({ params }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to login page
        router.push("/login");
        router.refresh();
      } else {
        alert("Failed to logout. Please try again.");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout");
      setIsLoggingOut(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError(
        "New password must be different from current password"
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowPasswordForm(false);
        }, 2000);
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2">
          Manage your account settings
        </p>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                Change Password
              </h3>
            </div>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {passwordError}
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                      {passwordSuccess}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min 8 characters)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white font-medium transition-colors">
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-red-900 dark:text-red-300 mb-1">
              Logout
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              Sign out from your account
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white font-medium transition-colors whitespace-nowrap">
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
