"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BrainCircuit,
  GraduationCap,
  Briefcase,
  BarChart3,
  LogOut,
  User
} from "lucide-react";

/**
 * Shared Sidebar component for all user roles.
 * Displays user identity details and role-appropriate navigation choices.
 * 
 * @returns {React.ReactElement} React render output
 * @author Arnav Garg
 * @version 1.0.0
 */
export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = session?.user?.role;
  const userName = session?.user?.name || "User";

  /**
   * Handle platform sign-out request.
   * 
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "STUDENT":
        return "Student";
      case "RECRUITER":
        return "Recruiter";
      case "PLACEMENT_OFFICER":
        return "Placement Officer";
      default:
        return "Member";
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case "STUDENT":
        return <GraduationCap className="w-4 h-4 text-cyan-400" />;
      case "RECRUITER":
        return <Briefcase className="w-4 h-4 text-purple-400" />;
      case "PLACEMENT_OFFICER":
        return <BarChart3 className="w-4 h-4 text-indigo-400" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <aside className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand logo & Top links */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            PlacementAI
          </span>
        </Link>

        {/* Dynamic Nav Lists */}
        <div className="space-y-6">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">
              Dashboard Navigation
            </div>
            <nav className="space-y-1">
              {userRole === "STUDENT" && (
                <Link
                  href="/student/dashboard"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pathname === "/student/dashboard"
                      ? "bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student Center
                </Link>
              )}

              {userRole === "RECRUITER" && (
                <Link
                  href="/recruiter/dashboard"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pathname === "/recruiter/dashboard"
                      ? "bg-purple-500/10 text-purple-300 border-l-2 border-purple-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Recruiter Console
                </Link>
              )}

              {userRole === "PLACEMENT_OFFICER" && (
                <Link
                  href="/officer/dashboard"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pathname === "/officer/dashboard"
                      ? "bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Officer Intelligence
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Info block */}
      <div className="p-4 border-t border-slate-900 bg-slate-900/10">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-900/30 border border-slate-800/40 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate text-slate-200">{userName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getRoleIcon()}
              <span className="text-[10px] text-slate-400 font-semibold">{getRoleLabel()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
