import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Handle GET request for student dashboard state.
 * Retrieves candidate resume analysis, active applications, and recommends
 * match rankings against current job positions.
 * 
 * @param {Request} req Request object
 * @returns {Promise<Response>} NextResponse with dashboard statistics and matched job records
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user details including resume and application list
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resume: true,
        applications: {
          include: {
            job: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const resume = user.resume;
    const applications = user.applications;
    const applicationsCount = applications.length;

    // Retrieve all active jobs from database
    const jobs = await prisma.job.findMany();
    const recommendedJobs = [];

    if (resume && resume.skills.length > 0) {
      const studentSkills = resume.skills.map((s) => s.toLowerCase());

      for (const job of jobs) {
        const jobSkills = job.skillsRequired.map((s) => s.toLowerCase());

        // Find intersecting skills
        const matchingSkills = jobSkills.filter((s) =>
          studentSkills.some((sk) => sk.includes(s) || s.includes(sk))
        );

        // Compute local overlap percentage
        const overlapRatio = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) : 0.5;
        let matchScore = Math.floor(overlapRatio * 40) + 60; // Base matching 60-100

        // Bonus if recommendedRoles matches job role title
        const roleMatched = resume.recommendedRoles.some((r) =>
          job.role.toLowerCase().includes(r.toLowerCase()) ||
          r.toLowerCase().includes(job.role.toLowerCase())
        );

        if (roleMatched) {
          matchScore = Math.min(matchScore + 15, 100);
        }

        const missingSkills = job.skillsRequired.filter(
          (js) => !studentSkills.some((s) => s.includes(js.toLowerCase()) || js.toLowerCase().includes(s))
        );

        recommendedJobs.push({
          id: job.id,
          company: job.company,
          role: job.role,
          description: job.description,
          package: job.package,
          location: job.location,
          matchScore,
          missingSkills,
          skillsRequired: job.skillsRequired,
          cgpaCut: job.cgpaCut,
          applied: applications.some((app) => app.jobId === job.id),
        });
      }

      // Sort by match score descending
      recommendedJobs.sort((a, b) => b.matchScore - a.matchScore);
    }

    return NextResponse.json({
      resume,
      applications,
      applicationsCount,
      userCgpa: user.cgpa || 0.0,
      recommendedJobs: recommendedJobs.slice(0, 8), // Top 8 matches
      missingSkillsCount: resume ? resume.missingSkills.length : 0,
    });
  } catch (error) {
    console.error("Dashboard info error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred loading dashboard information." },
      { status: 500 }
    );
  }
}
