"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import {
  FileText,
  Upload,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Loader2,
  Download,
  AlertCircle
} from "lucide-react";

/**
 * StudentDashboard Component.
 * The primary workspace for students to analyze resumes, view job matches,
 * filter recommendations, and prepare mock interviews.
 * 
 * @returns {React.ReactElement} React render output
 * @author Arnav Garg
 * @version 1.0.0
 */
export default function StudentDashboard() {
  // Page states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [sortBy, setSortBy] = useState("match");
  
  // Data states
  const [resume, setResume] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [userCgpa, setUserCgpa] = useState(0.0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Answers tracker for mock questions (interactive UI)
  const [answers, setAnswers] = useState({});
  const [submittingAnswers, setSubmittingAnswers] = useState({});
  const [gradedAnswers, setGradedAnswers] = useState({});

  // Fetch dashboard information
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/student/dashboard-info");
      const data = await res.json();
      if (res.ok) {
        setResume(data.resume);
        setApplicationsCount(data.applicationsCount);
        setRecommendedJobs(data.recommendedJobs);
        setUserCgpa(data.userCgpa || 0.0);
      } else {
        setErrorMsg(data.error || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Handle resume file selection and upload process.
   * 
   * @param {React.ChangeEvent} e File change event
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/student/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Resume uploaded and analyzed successfully!");
        setResume(data.resume);
        fetchDashboardData();
      } else {
        setErrorMsg(data.error || "Resume upload failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload resume. Check connection.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Triggers the generative AI interview question compiler.
   * 
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/student/interview/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("AI Interview preparation questions compiled!");
        if (resume) {
          setResume({ ...resume, questions: data.questions });
        }
      } else {
        setErrorMsg(data.error || "Questions generation failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error generating questions.");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  /**
   * Handles applying to job recommendations.
   * 
   * @param {string} jobId Database ID of job position
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleApply = async (jobId) => {
    try {
      const res = await fetch("/api/student/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Application submitted successfully!");
        setApplicationsCount((prev) => prev + 1);
        setRecommendedJobs((prev) =>
          prev.map((job) => (job.id === jobId ? { ...job, applied: true } : job))
        );
      } else {
        setErrorMsg(data.error || "Application submission failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to apply for this job.");
    }
  };

  /**
   * Evaluates student's practice interview response via AI backend API.
   * 
   * @param {string} questionText Question being answered
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleGradeAnswer = async (questionText) => {
    const answer = answers[questionText];
    if (!answer || answer.trim().length < 10) return;

    setSubmittingAnswers((prev) => ({ ...prev, [questionText]: true }));
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/student/interview/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, answer }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGradedAnswers((prev) => ({
          ...prev,
          [questionText]: {
            score: data.score,
            feedback: data.feedback,
          },
        }));
        setSuccessMsg("AI Grading complete!");
      } else {
        setErrorMsg(data.error || "Failed to grade your response.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to grading API.");
    } finally {
      setSubmittingAnswers((prev) => ({ ...prev, [questionText]: false }));
    }
  };

  /**
   * Simulates downloading a PDF/Text report of the resume analysis.
   * 
   * @author Arnav Garg
   * @version 1.0.0
   */
  const handleDownloadReport = () => {
    if (!resume) return;
    const reportContent = `
=============================================
PLACEMENTAI RESUME EVALUATION REPORT
=============================================
ATS Score: ${resume.atsScore}/100

STRENGTHS:
${resume.strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

AREAS OF IMPROVEMENT (WEAKNESSES):
${resume.weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}

RECOMMENDED CAREER ROLES:
${resume.recommendedRoles.join(", ")}

MISSING SKILLS IDENTIFIED:
${resume.missingSkills.join(", ")}

REPORT EXTRACTED ON: ${new Date().toLocaleDateString()}
Architected by Arnav Garg.
=============================================
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PlacementAI_Report_${resume.atsScore}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredJobs = recommendedJobs
    .filter((job) => {
      const matchQuery =
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchScore = job.matchScore >= minMatch;
      return matchQuery && matchScore;
    })
    .sort((a, b) => {
      if (sortBy === "match") {
        return b.matchScore - a.matchScore;
      } else {
        const packA = parseFloat(a.package.replace(/[^0-9.]/g, "")) || 0;
        const packB = parseFloat(b.package.replace(/[^0-9.]/g, "")) || 0;
        return packB - packA;
      }
    });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Compiling student dashboard metrics...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-slate-400 text-xs mt-1 flex flex-wrap items-center gap-2">
              <span>Analyze your credentials, practice interviews, and submit job applications.</span>
              {userCgpa > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-extrabold text-[10px]">
                  Academic CGPA: {userCgpa.toFixed(2)}
                </span>
              )}
            </p>
          </div>
          {resume && (
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Download Analysis Report
            </button>
          )}
        </header>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ATS Score */}
          <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                ATS Score Index
              </span>
              <span className="text-2xl font-black text-slate-200">
                {resume ? `${resume.atsScore}/100` : "N/A"}
              </span>
            </div>
          </Card>

          {/* Applications Count */}
          <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Applications Submitted
              </span>
              <span className="text-2xl font-black text-slate-200">{applicationsCount}</span>
            </div>
          </Card>

          {/* Recommended Jobs Count */}
          <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Recommended Openings
              </span>
              <span className="text-2xl font-black text-slate-200">{recommendedJobs.length}</span>
            </div>
          </Card>

          {/* Missing Skills Count */}
          <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Missing Skills Count
              </span>
              <span className="text-2xl font-black text-slate-200">
                {resume ? resume.missingSkills.length : 0}
              </span>
            </div>
          </Card>
        </section>

        {/* Resume Management / Analysis Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Upload card */}
          <Card className="border-slate-800/80 bg-slate-900/30 flex flex-col justify-center min-h-[300px]">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-200">
                {resume ? "Update Resume" : "Upload Candidate Resume"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Upload your resume in PDF format to run our AI intelligence parsing checks.
              </p>

              <div className="mt-6">
                <label className="relative inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-[0.98] transition-all">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing PDF...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Browse Files
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Analysis insights */}
          <Card className="lg:col-span-2 border-slate-800/80 bg-slate-900/30">
            {resume ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    AI Resume Parser Feedback
                  </h3>
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/35 rounded-full text-cyan-400 font-bold text-xs">
                    ATS Score: {resume.atsScore}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Key Profile Strengths
                    </h4>
                    <ul className="space-y-2">
                      {resume.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-cyan-500 font-bold mt-0.5">•</span>
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Improvement Areas
                    </h4>
                    <ul className="space-y-2">
                      {resume.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-purple-500 font-bold mt-0.5">•</span>
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Extracted Skills */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Extracted Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] text-slate-300 font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                      Missing Recommendation Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.missingSkills.length > 0 ? (
                        resume.missingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-md text-[10px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> None! Excellent match profile.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <FileText className="w-12 h-12 text-slate-700 mb-3" />
                <span className="text-sm font-semibold">No analysis report available</span>
                <span className="text-xs max-w-[280px] mt-1 leading-relaxed">
                  Upload your CV profile in PDF format using the browse section on the left to extract skills and score your compatibility indexes.
                </span>
              </div>
            )}
          </Card>
        </section>

        {/* Job Recommendations Section */}
        <section className="mb-12" id="jobs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-900 pb-4">
            <div>
              <h2 className="font-extrabold text-xl text-slate-200">AI Job Match Recommendations</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Jobs indexed by compatibility based on your extracted resume skills profile.
              </p>
            </div>

            {/* Filters panel */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-900 rounded-lg text-xs outline-none focus:border-cyan-500 text-slate-200 w-44"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-900 rounded-lg px-2 py-1">
                <Filter className="w-3 h-3 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-slate-400 focus:ring-0 outline-none font-bold cursor-pointer"
                >
                  <option value="match" className="bg-slate-950 text-slate-300">Sort by Match %</option>
                  <option value="package" className="bg-slate-950 text-slate-300">Sort by package</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-bold">
                <span>Min Match:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  className="w-10 bg-transparent text-center border-none text-[10px] text-cyan-400 focus:ring-0 outline-none"
                />
                <span>%</span>
              </div>
            </div>
          </div>

          {!resume ? (
            <Card className="flex flex-col items-center justify-center p-12 text-slate-500 border-slate-900 bg-slate-900/10">
              <Briefcase className="w-12 h-12 text-slate-700 mb-3" />
              <span className="text-sm font-semibold">Ready to Match Openings</span>
              <span className="text-xs max-w-[280px] mt-1 text-center leading-relaxed">
                Upload a CV file to trigger matching algorithms against current company postings.
              </span>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center p-12 border border-slate-900 rounded-2xl text-slate-500">
              No matching jobs found checking current filters. Try lowering the minimum match rating.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const cgpaCutoffFailed = userCgpa < job.cgpaCut;
                return (
                  <Card
                    key={job.id}
                    className="border-slate-800/60 bg-slate-900/20 hover:border-cyan-500/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                            {job.company}
                          </span>
                          <h4 className="font-extrabold text-base text-slate-200 mt-1">{job.role}</h4>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            job.matchScore >= 80
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : job.matchScore >= 60
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}
                        >
                          {job.matchScore}% Match
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-semibold mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                        <div>Location: <span className="text-slate-300">{job.location}</span></div>
                        <div>Package: <span className="text-slate-300">{job.package}</span></div>
                        <div>CGPA Cut: <span className={cgpaCutoffFailed ? "text-red-400 font-black" : "text-slate-300"}>{job.cgpaCut > 0 ? `${job.cgpaCut}+` : "None"}</span></div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          Required Skills
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.skillsRequired.map((skill, idx) => {
                            const isMissing = job.missingSkills.includes(skill);
                            return (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isMissing
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                                    : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                                }`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4 mt-2 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500">
                        {job.applied
                          ? "Applied pending review"
                          : cgpaCutoffFailed
                          ? `Requires min ${job.cgpaCut} CGPA`
                          : "Click below to submit profile"}
                      </span>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={job.applied || cgpaCutoffFailed}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
                          job.applied
                            ? "bg-slate-900 text-slate-500 border border-slate-800/40"
                            : cgpaCutoffFailed
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed"
                            : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        }`}
                      >
                        {job.applied ? "Applied" : cgpaCutoffFailed ? "Ineligible" : "Apply Now"}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* AI Interview Preparation Section */}
        <section id="interview" className="mb-8">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
            <div>
              <h2 className="font-extrabold text-xl text-slate-200">AI Mock Interview Preparation</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate real-time questions dynamically matching your resume details to practice.
              </p>
            </div>

            {resume && (
              <button
                onClick={handleGenerateQuestions}
                disabled={generatingQuestions}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
              >
                {generatingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Questions
                  </>
                )}
              </button>
            )}
          </div>

          {!resume ? (
            <Card className="flex flex-col items-center justify-center p-12 text-slate-500 border-slate-900 bg-slate-900/10">
              <HelpCircle className="w-12 h-12 text-slate-700 mb-3" />
              <span className="text-sm font-semibold">Generate Mock Questions</span>
              <span className="text-xs max-w-[280px] mt-1 text-center leading-relaxed">
                Resume upload is required to compile personalized preparation questions.
              </span>
            </Card>
          ) : !resume.questions ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center text-slate-400 border-slate-800 bg-slate-900/10">
              <Sparkles className="w-10 h-10 text-cyan-400 mb-3" />
              <h4 className="font-extrabold text-sm text-slate-300">Ready to Generate Questions</h4>
              <p className="text-xs max-w-[340px] mt-1 leading-relaxed">
                Click the compile button on the top right to analyze your skills and extract 5 Technical, 3 Behavioral, and 2 Project design questions.
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {/* Technical Questions */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Technical Questions (5)
                  </h3>
                  <div className="space-y-4">
                    {resume.questions.technical.map((q, idx) => (
                      <Card key={idx} className="border-slate-900 bg-slate-900/20 p-5">
                        <p className="text-xs font-bold text-slate-200">Q{idx + 1}: {q}</p>
                        <div className="mt-3 space-y-2">
                          <textarea
                            placeholder="Type your practice response here..."
                            value={answers[q] || ""}
                            onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs outline-none focus:border-cyan-500 text-slate-200 resize-none h-20"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Practice text submission (simulates AI feedback)</span>
                            <button
                              onClick={() => handleGradeAnswer(q)}
                              disabled={submittingAnswers[q] || !answers[q] || answers[q].trim().length < 10}
                              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold active:scale-[0.98] cursor-pointer"
                            >
                              {submittingAnswers[q] ? "Grading..." : "Submit Answer"}
                            </button>
                          </div>
                        </div>

                        {gradedAnswers[q] && (
                          <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-cyan-400">AI Scoring Grade</span>
                              <span className="font-black text-cyan-400">{gradedAnswers[q].score}%</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-400">
                              {gradedAnswers[q].feedback}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Behavioral Questions */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Behavioral & HR Questions (3)
                  </h3>
                  <div className="space-y-4">
                    {resume.questions.behavioral.map((q, idx) => (
                      <Card key={idx} className="border-slate-900 bg-slate-900/20 p-5">
                        <p className="text-xs font-bold text-slate-200">Q{idx + 1}: {q}</p>
                        <div className="mt-3 space-y-2">
                          <textarea
                            placeholder="Type your practice response here..."
                            value={answers[q] || ""}
                            onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs outline-none focus:border-purple-500 text-slate-200 resize-none h-20"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Practice text submission (simulates AI feedback)</span>
                            <button
                              onClick={() => handleGradeAnswer(q)}
                              disabled={submittingAnswers[q] || !answers[q] || answers[q].trim().length < 10}
                              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold active:scale-[0.98] cursor-pointer"
                            >
                              {submittingAnswers[q] ? "Grading..." : "Submit Answer"}
                            </button>
                          </div>
                        </div>

                        {gradedAnswers[q] && (
                          <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-purple-400">AI Scoring Grade</span>
                              <span className="font-black text-purple-400">{gradedAnswers[q].score}%</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-400">
                              {gradedAnswers[q].feedback}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Project Questions */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Project & Architecture Questions (2)
                  </h3>
                  <div className="space-y-4">
                    {resume.questions.project.map((q, idx) => (
                      <Card key={idx} className="border-slate-900 bg-slate-900/20 p-5">
                        <p className="text-xs font-bold text-slate-200">Q{idx + 1}: {q}</p>
                        <div className="mt-3 space-y-2">
                          <textarea
                            placeholder="Type your practice response here..."
                            value={answers[q] || ""}
                            onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 text-slate-200 resize-none h-20"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Practice text submission (simulates AI feedback)</span>
                            <button
                              onClick={() => handleGradeAnswer(q)}
                              disabled={submittingAnswers[q] || !answers[q] || answers[q].trim().length < 10}
                              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold active:scale-[0.98] cursor-pointer"
                            >
                              {submittingAnswers[q] ? "Grading..." : "Submit Answer"}
                            </button>
                          </div>
                        </div>

                        {gradedAnswers[q] && (
                          <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-indigo-400">AI Scoring Grade</span>
                              <span className="font-black text-indigo-400">{gradedAnswers[q].score}%</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-400">
                              {gradedAnswers[q].feedback}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
