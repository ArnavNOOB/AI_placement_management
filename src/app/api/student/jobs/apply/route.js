import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Handle POST request for applying to a job.
 * Creates an Application connection between the authenticated student and the job ID.
 * 
 * @param {Request} req Request object containing the jobId
 * @returns {Promise<Response>} NextResponse with status messages
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized access. Only students can apply to jobs." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400 }
      );
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // Verify student CGPA cutoff eligibility
    const student = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (job.cgpaCut > 0 && (!student || !student.cgpa || student.cgpa < job.cgpaCut)) {
      return NextResponse.json(
        { error: `Ineligible: This job opening requires a minimum academic CGPA of ${job.cgpaCut}.` },
        { status: 403 }
      );
    }

    // Check duplicate applications
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: session.user.id,
          jobId: jobId
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 400 }
      );
    }

    // Create the Application record in MongoDB
    const application = await prisma.application.create({
      data: {
        studentId: session.user.id,
        jobId: jobId,
        status: "PENDING"
      }
    });

    return NextResponse.json(
      {
        message: "Applied for job successfully.",
        application
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Job application error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during application." },
      { status: 500 }
    );
  }
}
