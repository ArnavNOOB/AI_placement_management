"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { UserPlus, Loader2, Mail, Lock, User, GraduationCap, Briefcase, BarChart3 } from "lucide-react";

/**
 * RegisterPage Client Component.
 * Offers visual cards for role selection (Student, Recruiter, Placement Officer)
 * and registration input forms styled in clean modern dark mode glassmorphism.
 * 
 * @returns {React.ReactElement} React render output
 * @author Arnav Garg
 * @version 1.0.0
 */
export default function RegisterPage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Proactive redirect if session is already active
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const activeRole = session.user.role;
      if (activeRole === "STUDENT") {
        router.push("/student/dashboard");
      } else if (activeRole === "RECRUITER") {
        router.push("/recruiter/dashboard");
      } else if (activeRole === "PLACEMENT_OFFICER") {
        router.push("/officer/dashboard");
      }
    }
  }, [status, session, router]);

  /**
   * Handle form submission, registering the user through the local API.
   * 
   * @param {React.FormEvent} e Form submit event
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !password || !role) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center relative px-4 py-16 bg-slate-950 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-2xl border-slate-800/80 bg-slate-900/40 relative z-10 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Get started with PlacementAI by choosing your platform role
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs text-center font-medium">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Student Role */}
              <div
                onClick={() => setRole("STUDENT")}
                className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col items-center text-center justify-center gap-2 ${
                  role === "STUDENT"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <GraduationCap className={`w-8 h-8 ${role === "STUDENT" ? "text-cyan-400" : "text-slate-500"}`} />
                <span className="font-bold text-sm">Student</span>
                <span className="text-[10px] leading-tight">Upload resumes & get AI mock prep</span>
              </div>

              {/* Recruiter Role */}
              <div
                onClick={() => setRole("RECRUITER")}
                className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col items-center text-center justify-center gap-2 ${
                  role === "RECRUITER"
                    ? "border-purple-500 bg-purple-500/10 text-purple-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Briefcase className={`w-8 h-8 ${role === "RECRUITER" ? "text-purple-400" : "text-slate-500"}`} />
                <span className="font-bold text-sm">Recruiter</span>
                <span className="text-[10px] leading-tight">Post jobs & screen candidates</span>
              </div>

              {/* Placement Officer Role */}
              <div
                onClick={() => setRole("PLACEMENT_OFFICER")}
                className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col items-center text-center justify-center gap-2 ${
                  role === "PLACEMENT_OFFICER"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <BarChart3 className={`w-8 h-8 ${role === "PLACEMENT_OFFICER" ? "text-indigo-400" : "text-slate-500"}`} />
                <span className="font-bold text-sm">Placement Officer</span>
                <span className="text-[10px] leading-tight">Monitor placement trends & stats</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="zyz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all text-slate-100"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm transition-all text-slate-100"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Register
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:underline hover:text-indigo-300 font-semibold transition-colors"
          >
            Sign In here
          </Link>
        </div>
      </Card>
    </div>
  );
}
