import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Handle POST request to update a candidate application status.
 * Accessible only by Placement Officers.
 * 
 * @param {Request} req Request object containing applicationId and status
 * @returns {Promise<Response>} NextResponse indicating status change success
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PLACEMENT_OFFICER") {
      return NextResponse.json(
        { error: "Unauthorized access. Only placement officers can update application statuses." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and new status are required." },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "ACCEPTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify application exists
    const existingApp = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    // Update status in database
    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully.",
      application: updatedApp
    });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred updating the application status." },
      { status: 500 }
    );
  }
}
