"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  DollarSign,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Megaphone,
  Calendar,
  Upload,
  User,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/actions/auth";

import type { UserProfile, UserRole } from "@/types/database";

interface AdminSidebarProps {
  user: UserProfile;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles?: UserRole[];
  children?: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/admissions",
    label: "Admissions",
    icon: UserPlus,
    roles: ["superadmin", "campus_admin", "admissions"],
    children: [
      { href: "/admin/admissions/leads", label: "Leads" },
      { href: "/admin/admissions/applications", label: "Applications" },
      { href: "/admin/enrollment-funnel", label: "Enrollment Funnel" },
      { href: "/admin/admissions/abandoned", label: "Abandoned Apps" },
    ],
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: Users,
    roles: ["superadmin", "campus_admin", "admissions", "financial_aid", "instructor", "registrar"],
  },
  {
    href: "/admin/attendance",
    label: "Attendance",
    icon: Clock,
    roles: ["superadmin", "campus_admin", "instructor", "registrar"],
  },
  {
    href: "/admin/financial-aid",
    label: "Financial Aid",
    icon: DollarSign,
    roles: ["superadmin", "campus_admin", "financial_aid"],
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    icon: Megaphone,
    roles: ["superadmin", "campus_admin"],
  },
  {
    href: "/admin/scheduling",
    label: "Scheduling",
    icon: Calendar,
    roles: ["superadmin", "campus_admin", "registrar"],
  },
  {
    href: "/admin/auditor/students",
    label: "Student Records",
    icon: User,
    roles: ["auditor"],
  },
  {
    href: "/admin/compliance",
    label: "Compliance",
    icon: ShieldCheck,
    roles: ["superadmin", "campus_admin", "auditor"],
  },
  {
    href: "/admin/audit-readiness",
    label: "Audit Readiness",
    icon: ClipboardCheck,
    roles: ["superadmin", "campus_admin", "auditor"],
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: FileText,
    roles: ["superadmin", "campus_admin", "registrar", "auditor"],
  },
  {
    href: "/admin/import",
    label: "Import Data",
    icon: Upload,
    roles: ["superadmin", "campus_admin", "registrar"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    roles: ["superadmin"],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const roleLabels: Record<UserRole, string> = {
    superadmin: "Super Admin",
    campus_admin: "Campus Admin",
    admissions: "Admissions",
    financial_aid: "Financial Aid",
    instructor: "Instructor",
    registrar: "Registrar",
    student: "Student",
    auditor: "Auditor",
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[hsl(222,47%,11%)] border border-[hsl(213,52%,20%)] text-[hsl(210,40%,98%)]"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - always dark regardless of theme */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-[hsl(222,47%,11%)] backdrop-blur-md border-r border-[hsl(213,52%,20%)] transition-transform",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[hsl(213,52%,20%)]">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <div>
                <span className="text-lg font-display font-semibold text-[hsl(210,40%,98%)]">
                  Mystros
                </span>
                <p className="text-xs text-amber-500">Admin Portal</p>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-[hsl(213,52%,20%)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-sm font-medium text-amber-400">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(210,40%,98%)] truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-amber-400">{roleLabels[user.role]}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              const isExpanded = expandedItems.includes(item.href);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.href}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-amber-500/20 text-amber-400"
                            : "text-[hsl(215,16%,47%)] hover:text-[hsl(210,40%,98%)] hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-sm transition-colors",
                                pathname === child.href
                                  ? "text-amber-400 bg-amber-500/10"
                                  : "text-[hsl(215,16%,47%)] hover:text-[hsl(210,40%,98%)] hover:bg-white/5"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-[hsl(215,16%,47%)] hover:text-[hsl(210,40%,98%)] hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer with profile and sign out */}
          <div className="p-4 border-t border-[hsl(213,52%,20%)] space-y-1">
            <Link
              href="/admin/profile"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors",
                pathname === "/admin/profile"
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-[hsl(215,16%,47%)] hover:text-[hsl(210,40%,98%)] hover:bg-white/5"
              )}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-[hsl(215,16%,47%)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
