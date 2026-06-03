"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import {
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Layers,
  Activity,
  CheckCircle,
  Loader2,
  AlertCircle,
  Trash2,
  Edit,
  PlusSquare,
  MapPin,
  CircleDollarSign,
  X,
  Search,
  Building2,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

/**
 * PlacementOfficerDashboard Component.
 * The primary operations command center for campus administrators.
 * Enables officers to monitor metrics, update student job application offers,
 * delete/modify active job listings, and post new recruiter openings.
 * 
 * @returns {React.ReactElement} React render output
 * @author Arnav Garg
 * @version 1.1.0
 */
export default function PlacementOfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tab State: "analytics" | "offers" | "jobs"
  const [activeTab, setActiveTab] = useState("analytics");

  // Search & Filter States
  const [offersSearch, setOffersSearch] = useState("");
  const [jobsSearch, setJobsSearch] = useState("");

  // Job Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingJobId, setEditingJobId] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [jobPackage, setJobPackage] = useState("");
  const [location, setLocation] = useState("");
  const [cgpaCut, setCgpaCut] = useState("");
  const [submittingForm, setSubmittingForm] = useState(false);

  // Status updating state
  const [updatingAppId, setUpdatingAppId] = useState("");

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/officer/analytics");
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      } else {
        setErrorMsg(resData.error || "Failed to load officer metrics.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error loading analytics dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmittingForm(true);
    setErrorMsg("");
    setSuccessMsg("");

    const skillsRequired = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (skillsRequired.length === 0) {
      setErrorMsg("Please enter at least one required skill.");
      setSubmittingForm(false);
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

      const resData = await res.json();

      if (res.ok) {
        setSuccessMsg(modalMode === "create" ? "Job posted successfully!" : "Job updated successfully!");
        setIsModalOpen(false);
        resetForm();
        fetchAnalytics();
      } else {
        setErrorMsg(resData.error || "Failed to submit job changes.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error saving job info.");
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job opening? This will cascade delete associated applications.")) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/recruiter/jobs/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSuccessMsg("Job deleted successfully!");
        fetchAnalytics();
      } else {
        const resData = await res.json();
        setErrorMsg(resData.error || "Failed to delete job.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error during job deletion.");
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setUpdatingAppId(applicationId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/officer/applications/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus })
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        setSuccessMsg(`Status updated to ${newStatus} successfully!`);
        fetchAnalytics();
      } else {
        setErrorMsg(resData.error || "Failed to update application status.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error updating application status.");
    } finally {
      setUpdatingAppId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Compiling campus intelligence metrics...
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { counters, recentJobs, recentApplications, allJobs = [], allApplications = [], departmentStats, placementTrends, applicationsByStatus } = data;
  const maxTrendVal = Math.max(...placementTrends.map((t) => Math.max(t.applications, t.placed, 10)));

  // Filter application listings
  const filteredApplications = allApplications.filter(app => 
    app.student.name.toLowerCase().includes(offersSearch.toLowerCase()) ||
    app.student.email.toLowerCase().includes(offersSearch.toLowerCase()) ||
    app.job.role.toLowerCase().includes(offersSearch.toLowerCase()) ||
    app.job.company.toLowerCase().includes(offersSearch.toLowerCase())
  );

  // Filter job listings
  const filteredJobsList = allJobs.filter(job => 
    job.company.toLowerCase().includes(jobsSearch.toLowerCase()) ||
    job.role.toLowerCase().includes(jobsSearch.toLowerCase()) ||
    job.location.toLowerCase().includes(jobsSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Campus Intelligence
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Analyze student placement analytics, edit job applications, and update recruiter job postings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Analytics Hub
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "offers"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Student Offers ({allApplications.length})
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Manage Jobs ({allJobs.length})
            </button>
          </div>
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

        {/* Tab 1: Analytics Hub */}
        {activeTab === "analytics" && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Registered Students</span>
                  <span className="text-2xl font-black text-slate-200">{counters.totalStudents}</span>
                </div>
              </Card>

              <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Eligible Profile Pipelines</span>
                  <span className="text-2xl font-black text-slate-200">{counters.eligibleStudents}</span>
                </div>
              </Card>

              <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Students Placed (Offers)</span>
                  <span className="text-2xl font-black text-slate-200">{counters.placedStudents}</span>
                </div>
              </Card>

              <Card className="flex items-center gap-4 border-slate-900 bg-slate-900/15">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Placements Rate</span>
                  <span className="text-2xl font-black text-slate-200">{counters.placementPercentage}%</span>
                </div>
              </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <Card className="border-slate-800/80 bg-slate-900/20 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-300 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Monthly Placement Trends
                  </h3>
                  
                  <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-slate-900 pb-2 px-2">
                    {placementTrends.map((t, idx) => {
                      const appHeight = `${(t.applications / maxTrendVal) * 100}%`;
                      const placedHeight = `${(t.placed / maxTrendVal) * 100}%`;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="w-full flex items-end justify-center gap-1 h-36 relative">
                            <div
                              style={{ height: appHeight }}
                              className="w-3.5 bg-slate-800 hover:bg-slate-700 rounded-t transition-all relative cursor-pointer"
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold whitespace-nowrap text-slate-300">
                                {t.applications} Apps
                              </span>
                            </div>
                            <div
                              style={{ height: placedHeight }}
                              className="w-3.5 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t transition-all relative cursor-pointer"
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold whitespace-nowrap text-cyan-300">
                                {t.placed} Placed
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold mt-1">{t.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center gap-4 text-[9px] mt-4 font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-slate-800 rounded" />
                    Job Applications
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-cyan-500 rounded" />
                    Successful Placements
                  </span>
                </div>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/20">
                <h3 className="font-extrabold text-sm text-slate-300 flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Department Placement Ratios
                </h3>

                <div className="space-y-4 pt-2">
                  {departmentStats.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No department metrics found. Ensure students register credentials.
                    </div>
                  ) : (
                    departmentStats.map((dept, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-300">{dept.name}</span>
                          <span className="text-slate-400">
                            {dept.placed}/{dept.total} ({dept.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${dept.percentage}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/20">
                <h3 className="font-extrabold text-sm text-slate-300 flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Application Pipelines
                </h3>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pending Reviews
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">{applicationsByStatus.PENDING}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Active Screening
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">{applicationsByStatus.REVIEWING}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Shortlisted Candidates
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">{applicationsByStatus.SHORTLISTED}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Offers Accepted
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">{applicationsByStatus.ACCEPTED}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Rejected Profiles
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">{applicationsByStatus.REJECTED}</span>
                  </div>
                </div>
              </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-slate-800/80 bg-slate-900/20">
                <h3 className="font-extrabold text-sm text-slate-300 flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  Latest Job Openings ({recentJobs.length})
                </h3>
                
                <div className="space-y-4">
                  {recentJobs.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No recent jobs posted.
                    </div>
                  ) : (
                    recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex justify-between items-center border-b border-slate-900 pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-200">{job.role}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                          {job.package}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/20">
                <h3 className="font-extrabold text-sm text-slate-300 flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Recent Student Submissions ({recentApplications.length})
                </h3>

                <div className="space-y-4">
                  {recentApplications.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No recent job submissions logged.
                    </div>
                  ) : (
                    recentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex justify-between items-center border-b border-slate-900 pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-200">{app.student.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Applied to <span className="text-slate-300">{app.job.role}</span> at <span className="text-slate-300">{app.job.company}</span>
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                            app.status === "ACCEPTED"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : app.status === "REJECTED"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : app.status === "PENDING"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>
          </>
        )}

        {/* Tab 2: Manage Offers (Applications) */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-900 bg-slate-950 p-4 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by student, role, or company..."
                  value={offersSearch}
                  onChange={(e) => setOffersSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 text-slate-200 w-full"
                />
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded-xl font-bold">
                Total Submissions: {filteredApplications.length}
              </span>
            </div>

            <Card className="border-slate-800/80 bg-slate-900/20 p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-950/40">
                      <th className="p-4">Student Info</th>
                      <th className="p-4">Applied Job</th>
                      <th className="p-4">Package</th>
                      <th className="p-4 font-center">Compensation Details</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4 text-right">Update Status Offer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">
                          No student offers or job applications matched the query.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-200">{app.student.name}</div>
                            <div className="text-[10px] text-slate-500">{app.student.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-200">{app.job.role}</div>
                            <div className="text-[10px] text-slate-500">{app.job.company}</div>
                          </td>
                          <td className="p-4 font-semibold text-slate-200">{app.job.package}</td>
                          <td className="p-4 text-slate-400 text-[10px]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {app.job.location}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase ${
                                app.status === "ACCEPTED"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : app.status === "REJECTED"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : app.status === "PENDING"
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {updatingAppId === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 ml-auto" />
                            ) : (
                              <div className="inline-flex flex-wrap justify-end gap-1.5">
                                {["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "ACCEPTED"].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateStatus(app.id, st)}
                                    className={`px-2 py-0.5 rounded text-[8px] font-black border transition-all cursor-pointer ${
                                      app.status === st
                                        ? "bg-indigo-500 text-white border-indigo-600 scale-[1.02]"
                                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                    }`}
                                  >
                                    {st === "ACCEPTED" ? "ACCEPT (PLACE)" : st}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Manage Jobs & Companies */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-900 bg-slate-950 p-4 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by company, role, or location..."
                  value={jobsSearch}
                  onChange={(e) => setJobsSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 text-slate-200 w-full"
                />
              </div>
              
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-[0.98] transition-all w-full sm:w-auto justify-center"
              >
                <PlusSquare className="w-4 h-4" />
                Add New Job / Company
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobsList.length === 0 ? (
                <div className="col-span-full text-center py-20 border border-slate-900 rounded-2xl text-slate-500 bg-slate-900/10">
                  No active jobs or company postings match the query.
                </div>
              ) : (
                filteredJobsList.map((job) => (
                  <Card key={job.id} className="border-slate-800/80 bg-slate-900/20 hover:border-slate-700/60 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                          <Building2 className="w-2.5 h-2.5" />
                          {job.company}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-200 mt-3">{job.role}</h4>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-4">
                        {job.skillsRequired.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-950 border border-slate-900 text-slate-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
                        {job.package}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Job Creator / Editor Dialog Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
            <Card className="w-full max-w-lg border-slate-800 bg-slate-950 p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold text-slate-200 mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {modalMode === "create" ? "Add New Job / Company" : "Edit Job / Company Details"}
              </h2>

              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company / Recruiter</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none h-20"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
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
                    disabled={submittingForm}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
                  >
                    {submittingForm && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Job Posting
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
