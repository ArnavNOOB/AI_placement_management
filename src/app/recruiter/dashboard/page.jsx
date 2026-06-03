"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import {
  Briefcase,
  PlusSquare,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  User,
  Sparkles,
  MapPin,
  CircleDollarSign,
  Send,
  X
} from "lucide-react";

/**
 * RecruiterDashboard Client Component.
 * Implements job CRUD dialog forms and ranks student candidate pools against 
 * selected technical job descriptions using AI metrics.
 * 
 * @returns {React.ReactElement} React render output
 * @author Arnav Garg
 * @version 1.0.0
 */
export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingJobId, setEditingJobId] = useState("");
  
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [jobPackage, setJobPackage] = useState("");
  const [location, setLocation] = useState("");
  const [cgpaCut, setCgpaCut] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [invitedStudents, setInvitedStudents] = useState({});

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/recruiter/jobs");
      const data = await res.json();
      if (res.ok) {
        setJobs(data);
        if (data.length > 0 && !selectedJob) {
          setSelectedJob(data[0]);
        }
      } else {
        setErrorMsg(data.error || "Failed to load jobs list.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error fetching jobs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (jobId) => {
    setLoadingCandidates(true);
    try {
      const res = await fetch(`/api/recruiter/candidates?jobId=${jobId}`);
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.candidates);
      } else {
        setErrorMsg(data.error || "Failed to calculate candidate rankings.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error matching candidates.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchCandidates(selectedJob.id);
    } else {
      setCandidates([]);
    }
  }, [selectedJob]);

  const resetForm = () => {
    setCompany("");
    setRole("");
    setDescription("");
    setSkillsInput("");
    setJobPackage("");
    setLocation("");
    setCgpaCut("");
    setEditingJobId("");
    setErrorMsg("");
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setModalMode("edit");
    setEditingJobId(job.id);
    setCompany(job.company);
    setRole(job.role);
    setDescription(job.description);
    setSkillsInput(job.skillsRequired.join(", "));
    setJobPackage(job.package);
    setLocation(job.location);
    setCgpaCut(job.cgpaCut !== undefined ? String(job.cgpaCut) : "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const skillsRequired = skillsInput.split(",").map((s) => s.trim()).filter((s) => s !== "");

    if (skillsRequired.length === 0) {
      setErrorMsg("Please enter at least one required skill.");
      return;
    }

    const url = modalMode === "create" ? "/api/recruiter/jobs" : `/api/recruiter/jobs/${editingJobId}`;
    const method = modalMode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          description,
          skillsRequired,
          package: jobPackage,
          location,
          cgpaCut: cgpaCut ? parseFloat(cgpaCut) : 0.0
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(modalMode === "create" ? "Job posted successfully!" : "Job updated successfully!");
        setIsModalOpen(false);
        resetForm();
        
        const updatedJobsRes = await fetch("/api/recruiter/jobs");
        const updatedJobs = await updatedJobsRes.json();
        setJobs(updatedJobs);

        if (modalMode === "create" && updatedJobs.length > 0) {
          setSelectedJob(updatedJobs[0]);
        } else if (modalMode === "edit") {
          const match = updatedJobs.find((j) => j.id === editingJobId);
          if (match) setSelectedJob(match);
        }
      } else {
        setErrorMsg(data.error || "Form submission failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error saving job details.");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job posting? This cannot be undone.")) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/recruiter/jobs/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSuccessMsg("Job deleted successfully!");
        const updatedJobs = jobs.filter((j) => j.id !== id);
        setJobs(updatedJobs);
        if (selectedJob?.id === id) {
          setSelectedJob(updatedJobs[0] || null);
        }
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete job.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error during job deletion.");
    }
  };

  const handleInviteCandidate = (studentId) => {
    setInvitedStudents((prev) => ({ ...prev, [studentId]: true }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Compiling recruiter credentials...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Recruiter Console
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Add job posts and view automated AI candidate compatibility matches.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/10 cursor-pointer active:scale-[0.98] transition-all"
          >
            <PlusSquare className="w-4 h-4" />
            Post New Job
          </button>
        </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Posted Openings ({jobs.length})
            </h3>
            
            {jobs.length === 0 ? (
              <div className="text-center p-12 border border-slate-900 rounded-2xl text-slate-500">
                No active jobs posted. Create one using the top right action button.
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`cursor-pointer text-left ${
                      selectedJob?.id === job.id ? "ring-1 ring-purple-500/80" : ""
                    }`}
                  >
                    <Card
                      className={`border-slate-800/80 bg-slate-900/25 hover:border-slate-700/60 p-5 ${
                        selectedJob?.id === job.id ? "bg-slate-900/50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                            {job.company}
                          </span>
                          <h4 className="font-extrabold text-base text-slate-200 mt-2">{job.role}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(job);
                            }}
                            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <CircleDollarSign className="w-3 h-3 text-slate-500" />
                          {job.package}
                        </span>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedJob ? (
              <div className="space-y-4">
                <div className="border border-slate-900 bg-slate-950 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Matching For:</span>
                    <h3 className="font-extrabold text-lg text-slate-200 mt-0.5">
                      {selectedJob.role} <span className="text-slate-500">@</span> {selectedJob.company}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded-xl font-bold">
                    Required skills: {selectedJob.skillsRequired.length}
                  </span>
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ranked Applicant Compatibility ({candidates.length})
                </h3>

                {loadingCandidates ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-2" />
                    <span className="text-xs">Running AI candidate compatibility match scoring...</span>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-20 border border-slate-900 rounded-2xl text-slate-500 bg-slate-900/10">
                    No matching candidate profiles found. Ensure students upload resumes.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                    {candidates.map((cand) => (
                      <Card key={cand.id} className="border-slate-800/60 bg-slate-900/10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-slate-300">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-200">{cand.name}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">{cand.email}</p>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {cand.skills.map((s, idx) => {
                                  const isMatching = cand.matchingSkills.some(ms => ms.toLowerCase() === s.toLowerCase());
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                        isMatching
                                          ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                                          : "bg-slate-900 border border-slate-800 text-slate-400"
                                      }`}
                                    >
                                      {s}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-slate-500 font-bold uppercase">ATS Score:</span>
                              <span className="text-xs text-slate-300 font-extrabold">{cand.atsScore}%</span>
                            </div>
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                                cand.matchScore >= 80
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : cand.matchScore >= 60
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}
                            >
                              {cand.matchScore}% Match
                            </span>

                            <button
                              onClick={() => handleInviteCandidate(cand.id)}
                              disabled={invitedStudents[cand.id]}
                              className={`px-3 py-1 rounded-lg text-[9px] font-extrabold mt-2 flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98] ${
                                invitedStudents[cand.id]
                                  ? "bg-slate-900 text-emerald-400 border border-emerald-500/20"
                                  : "bg-purple-500 text-white hover:bg-purple-400"
                              }`}
                            >
                              <Send className="w-2.5 h-2.5" />
                              {invitedStudents[cand.id] ? "Invitation Sent" : "Send Invite"}
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-16 text-slate-500 border-slate-900 bg-slate-900/10 h-[350px]">
                <Sparkles className="w-12 h-12 text-slate-800 mb-3" />
                <span className="text-sm font-semibold">Select Job Posting</span>
                <span className="text-xs max-w-[280px] mt-1 text-center leading-relaxed">
                  Choose an active job posting from the left pane to view ranked candidate profiles.
                </span>
              </Card>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
            <Card className="w-full max-w-lg border-slate-800 bg-slate-950 p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-slate-200 mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {modalMode === "create" ? "Post New Job" : "Edit Job Details"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    placeholder="Provide role deliverables, expectations, and requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500 resize-none h-20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Next.js, Docker"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Package</label>
                    <input
                      type="text"
                      placeholder="e.g. 14 LPA"
                      value={jobPackage}
                      onChange={(e) => setJobPackage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CGPA Cutoff</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 7.5"
                      value={cgpaCut}
                      onChange={(e) => setCgpaCut(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-[0.98] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
