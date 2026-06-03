import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Handle GET request to match and rank candidates against a job ID.
 * Queries all students with resumes, runs matching calculations, and returns ranked list.
 * 
 * @param {Request} req Request object containing jobId as query parameter
 * @returns {Promise<Response>} NextResponse containing ranked candidate profiles
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["RECRUITER", "PLACEMENT_OFFICER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required to calculate compatibility matches." },
        { status: 400 }
      );
    }

    // Fetch the target Job details
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job opening not found." },
        { status: 404 }
      );
    }

    // Fetch all students who have uploaded a resume
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        resume: { isNot: null }
      },
      include: {
        resume: true
      }
    });

    const jobRequiredSkillsLower = job.skillsRequired.map((s) => s.toLowerCase());
    const jobRoleLower = job.role.toLowerCase();

    const candidateMatches = students.map((student) => {
      const resume = student.resume;
      const studentSkillsLower = resume.skills.map((s) => s.toLowerCase());

      // Calculate intersection overlap of skills
      const matchingSkills = jobRequiredSkillsLower.filter((js) =>
        studentSkillsLower.some((ss) => ss.includes(js) || js.includes(ss))
      );

      const skillRatio = jobRequiredSkillsLower.length > 0
        ? (matchingSkills.length / jobRequiredSkillsLower.length)
        : 0.5;

      let matchScore = Math.floor(skillRatio * 40) + 60; // Base 60 to 100

      // Add a bonus if target job title overlaps recommended roles
      const roleMatched = resume.recommendedRoles.some((r) =>
        jobRoleLower.includes(r.toLowerCase()) ||
        r.toLowerCase().includes(jobRoleLower)
      );

      if (roleMatched) {
        matchScore = Math.min(matchScore + 15, 100);
      }

      // If no skills overlap at all, adjust score downward
      if (matchingSkills.length === 0 && jobRequiredSkillsLower.length > 0) {
        matchScore = Math.max(matchScore - 30, 20);
      }

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        atsScore: resume.atsScore,
        skills: resume.skills,
        recommendedRoles: resume.recommendedRoles,
        matchScore,
        matchingSkills: job.skillsRequired.filter((s) =>
          studentSkillsLower.some((ss) => ss.includes(s.toLowerCase()) || s.toLowerCase().includes(ss))
        )
      };
    });

    // Sort candidates by matchScore descending
    candidateMatches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      job,
      candidates: candidateMatches
    });
  } catch (error) {
    console.error("Candidate matching error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred ranking candidates." },
      { status: 500 }
    );
  }
}
