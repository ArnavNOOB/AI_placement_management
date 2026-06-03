import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Handle PUT request to update an existing job posting.
 * Verifies recruiter session, validates input, and updates MongoDB.
 * 
 * @param {Request} req Request object containing update details
 * @param {Object} context Context containing dynamic URL params like id
 * @returns {Promise<Response>} NextResponse with updated job details
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["RECRUITER", "PLACEMENT_OFFICER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { company, role, description, skillsRequired, package: jobPackage, location, cgpaCut } = body;

    // Verify job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job opening not found." },
        { status: 404 }
      );
    }

    const parsedCgpaCut = cgpaCut !== undefined ? parseFloat(cgpaCut) : undefined;

    // Update in MongoDB
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        company: company ?? existingJob.company,
        role: role ?? existingJob.role,
        description: description ?? existingJob.description,
        skillsRequired: skillsRequired ? skillsRequired.map((s) => s.trim()) : existingJob.skillsRequired,
        package: jobPackage ?? existingJob.package,
        location: location ?? existingJob.location,
        cgpaCut: (parsedCgpaCut !== undefined && !isNaN(parsedCgpaCut)) ? parsedCgpaCut : existingJob.cgpaCut
      }
    });

    return NextResponse.json({
      message: "Job updated successfully.",
      job: updatedJob
    });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during job update." },
      { status: 500 }
    );
  }
}

/**
 * Handle DELETE request to remove a job posting.
 * Verifies recruiter session, cascades associated applications, and deletes document from MongoDB.
 * 
 * @param {Request} req Request object
 * @param {Object} context Context containing dynamic URL params like id
 * @returns {Promise<Response>} NextResponse indicating success
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["RECRUITER", "PLACEMENT_OFFICER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job opening not found." },
        { status: 404 }
      );
    }

    // Delete job (related applications are deleted cascadingly as specified in schema)
    await prisma.job.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Job deleted successfully."
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during job deletion." },
      { status: 500 }
    );
  }
}
