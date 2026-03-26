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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar({ user, projectId }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projectOpen, setProjectOpen] = useState(true);

  const mainNav = [
    { name: "Profile", href: `/${user}/profile`, icon: User },
    { name: "Settings", href: `/${user}/settings`, icon: Settings },
    { name: "My Projects", href: `/${user}/my-projects`, icon: FolderKanban },
  ];

  const projectNav = projectId
    ? [
        { name: "Dashboard", href: `/${user}/${projectId}`, icon: Home },
        {
          name: "Baselines",
          href: `/${user}/${projectId}/baselines`,
          icon: GitBranch,
        },
        {
          name: "Modules",
          href: `/${user}/${projectId}/modules`,
          icon: FolderKanban,
        },
        {
          name: "Config",
          href: `/${user}/${projectId}/config`,
          icon: Settings,
        },
        {
          name: "Changes",
          href: `/${user}/${projectId}/changes`,
          icon: FileText,
          children: [
            { name: "All Changes", href: `/${user}/${projectId}/changes` },
            { name: "New Change", href: `/${user}/${projectId}/changes/new` },
          ],
        },
        {
          name: "Impacts",
          href: `/${user}/${projectId}/impacts`,
          icon: FileText,
        },
      ]
    : [];

  const handleLinkClick = () => setIsMobileMenuOpen(false);

  const linkClass = (isActive) =>
    `flex items-center gap-3 rounded-lg transition-colors px-3 py-2 text-sm ${
      isActive
        ? "bg-blue-700 text-white shadow"
        : "text-blue-100 hover:bg-blue-800 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-blue-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-blue-50">Scope-Creep</h2>
          <p className="text-xs text-blue-200">@{user}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-50 p-2 hover:bg-blue-800 rounded-lg transition-colors"
            aria-label="Toggle collapse">
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
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
        className={`fixed lg:static inset-y-0 left-0 z-40 ${
          isCollapsed ? "w-20" : "w-64 lg:w-64"
        } shrink-0 min-h-screen bg-slate-950 text-blue-50 p-2 md:p-4 flex flex-col border-r border-blue-800 transform transition-all duration-200 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}>
        {/* Brand */}
        <div
          className={`mb-6 flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="bg-blue-700 rounded-md h-10 w-10 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div className={`${isCollapsed ? "sr-only" : ""}`}>
            <h2 className="text-lg font-bold text-blue-50">Scope-Creep</h2>
            <p className="text-xs text-blue-200">@{user}</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 mt-2">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`${isCollapsed ? "justify-center" : ""} ${linkClass(isActive)} flex ${isCollapsed ? "px-0" : "px-3"}`}>
                <Icon className="h-5 w-5" />
                <span className={`${isCollapsed ? "sr-only" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Project group (nested) */}
          {projectNav.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setProjectOpen(!projectOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-blue-800 hover:text-white ${
                  projectOpen ? "bg-blue-700 text-white" : ""
                } ${isCollapsed ? "justify-center" : ""}`}>
                <GitBranch className="h-5 w-5" />
                <span
                  className={`${isCollapsed ? "sr-only" : ""} flex-1 text-left`}>
                  Project
                </span>
                {!isCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${projectOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {projectOpen && !isCollapsed && (
                <div className="mt-1 pl-8 space-y-1">
                  {projectNav.map((p) => {
                    const PIcon = p.icon;
                    const isActive =
                      pathname === p.href ||
                      (p.children &&
                        p.children.some((c) => pathname === c.href));

                    // parent with children (e.g., Changes)
                    if (p.children) {
                      return (
                        <div key={p.href} className="space-y-1">
                          <Link
                            href={p.href}
                            onClick={handleLinkClick}
                            className={linkClass(isActive)}>
                            <PIcon className="h-4 w-4" />
                            <span>{p.name}</span>
                          </Link>
                          <div className="pl-6 space-y-1">
                            {p.children.map((c) => {
                              const childActive = pathname === c.href;
                              return (
                                <Link
                                  key={c.href}
                                  href={c.href}
                                  onClick={handleLinkClick}
                                  className={`block text-sm rounded px-2 py-1 ${childActive ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white"}`}>
                                  {c.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={p.href}
                        href={p.href}
                        onClick={handleLinkClick}
                        className={linkClass(isActive)}>
                        <PIcon className="h-4 w-4" />
                        <span>{p.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer controls */}
        <div className="mt-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors">
            <span className="sr-only">Toggle sidebar</span>
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
            <span className={`${isCollapsed ? "sr-only" : ""}`}>Collapse</span>
          </button>
        </div>
      </div>
    </>
  );
}
