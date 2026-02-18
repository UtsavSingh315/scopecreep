"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Settings,
  FolderKanban,
  GitBranch,
  FileText,
  Menu,
  X,
} from "lucide-react";

export function Sidebar({ user, projectId }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Profile",
      href: `/${user}/profile`,
      icon: User,
      show: true,
    },
    {
      name: "Settings",
      href: `/${user}/settings`,
      icon: Settings,
      show: true,
    },
    {
      name: "My Projects",
      href: `/${user}/my-projects`,
      icon: FolderKanban,
      show: true,
    },
    {
      name: "Dashboard",
      href: `/${user}/${projectId}`,
      icon: Home,
      show: !!projectId,
    },
    {
      name: "Baselines",
      href: `/${user}/${projectId}/baselines`,
      icon: GitBranch,
      show: !!projectId,
    },
    {
      name: "Changes",
      href: `/${user}/${projectId}/changes`,
      icon: FileText,
      show: !!projectId,
    },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-blue-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-blue-50">Scope-Creep</h2>
          <p className="text-xs text-blue-200">@{user}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-blue-50 p-2 hover:bg-blue-800 rounded-lg transition-colors"
          aria-label="Toggle menu">
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-64 shrink-0 min-h-screen bg-slate-950 text-blue-50 p-4 flex flex-col border-r border-blue-800 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}>
        <div className="mb-8 hidden lg:block">
          <h2 className="text-xl font-bold text-blue-50">Scope-Creep</h2>
          <p className="text-sm text-blue-200">@{user}</p>
        </div>
        <nav className="flex-1 space-y-2 mt-16 lg:mt-0">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white shadow-md"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>
      </div>
    </>
  );
}
