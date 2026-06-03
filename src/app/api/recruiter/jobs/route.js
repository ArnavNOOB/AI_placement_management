import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Handle GET request to retrieve all jobs in the system.
 * Verifies if the active user session is a RECRUITER or PLACEMENT_OFFICER.
 * 
 * @param {Request} req Request object
 * @returns {Promise<Response>} NextResponse containing list of jobs
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

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred retrieving job lists." },
      { status: 500 }
    );
  }
}

/**
 * Handle POST request to create a new job opening.
 * Verifies RECRUITER role permissions, validates inputs, and inserts to MongoDB.
 * 
 * @param {Request} req Request object containing job fields
 * @returns {Promise<Response>} NextResponse indicating created status
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["RECRUITER", "PLACEMENT_OFFICER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access. Only recruiters and placement officers can create jobs." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { company, role, description, skillsRequired, package: jobPackage, location, cgpaCut } = body;

    // Validate inputs
    if (!company || !role || !description || !skillsRequired || !jobPackage || !location) {
      return NextResponse.json(
        { error: "All job fields (company, role, description, skillsRequired, package, location) are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(skillsRequired) || skillsRequired.length === 0) {
      return NextResponse.json(
        { error: "Skills required must be a non-empty array of strings." },
        { status: 400 }
      );
    }

    const parsedCgpaCut = cgpaCut ? parseFloat(cgpaCut) : 0.0;

    // Insert into MongoDB
    const job = await prisma.job.create({
      data: {
        company,
        role,
        description,
        skillsRequired: skillsRequired.map((s) => s.trim()),
        package: jobPackage,
        location,
        cgpaCut: isNaN(parsedCgpaCut) ? 0.0 : parsedCgpaCut
      }
    });

    return NextResponse.json(
      {
        message: "Job created successfully.",
        job
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during job creation." },
      { status: 500 }
    );
  }
}
