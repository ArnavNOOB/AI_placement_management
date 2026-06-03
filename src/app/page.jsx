import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BrainCircuit, GraduationCap, Briefcase, BarChart3, ChevronRight, Zap } from "lucide-react";

/**
 * LandingPage Server Component.
 * Implements a premium, visual landing experience introducing PlacementAI.
 * 
 * @returns {React.ReactElement} React render output
 * @author Arnav Garg
 * @version 1.0.0
 */
export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative min-h-screen">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-indigo-500/15 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      {/* Navigation bar */}
      <nav className="relative z-10 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/10">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            PlacementAI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-8 animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          <span>Generative AI-Powered Campus Recruitment</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-4xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          The Smart Gateway to Campus Placements
        </h1>
        <p className="text-slate-400 text-base md:text-xl max-w-2xl mt-6 leading-relaxed">
          Unlock intelligence throughout the placement cycle. Upload resumes for instant ATS grading, matched recommendations, recruiter rankings, and personalized mock interview practice.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-cyan-400/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            Register Profile
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Roles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24">
          <Card className="flex flex-col items-center text-center p-6 border-slate-900 bg-slate-900/25">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-200">For Students</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Upload resumes for AI scoring, map missing skills, find custom matches, and prep with AI behavioral and technical interview questions.
            </p>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 border-slate-900 bg-slate-900/25">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-200">For Recruiters</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Post technical jobs, query candidate pipelines, and view real-time matched applicant lists with integrated AI compatibility and ATS scoring.
            </p>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 border-slate-900 bg-slate-900/25">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-200">For Placement Officers</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Supervise placement percentages, track overall stats, map department-level trends, and monitor recent system applications activity.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-950/60 py-8 px-6 text-center text-slate-500 text-xs mt-auto">
        <p>© 2026 PlacementAI Platform. Architected by Arnav Garg. Version 1.0.0. All rights reserved.</p>
      </footer>
    </div>
  );
}
