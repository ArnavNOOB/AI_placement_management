import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiService } from "@/lib/gemini";

/**
 * Handle POST request to generate interview prep questions.
 * Extracts candidate profile metadata, queries the Gemini mock interviewer engine,
 * and saves the generated questions to MongoDB.
 * 
 * @param {Request} req Request object
 * @returns {Promise<Response>} NextResponse containing structured interview questions
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch the candidate's resume
    const resume = await prisma.resume.findUnique({
      where: { userId }
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Please upload a resume first to generate questions." },
        { status: 400 }
      );
    }

    // Call Gemini generator
    const questions = await geminiService.generateInterviewQuestions(
      resume.skills,
      resume.recommendedRoles
    );

    // Save questions into Resume in MongoDB
    const updatedResume = await prisma.resume.update({
      where: { id: resume.id },
      data: {
        questions: {
          technical: questions.technical,
          behavioral: questions.behavioral,
          project: questions.project
        }
      }
    });

    return NextResponse.json({
      message: "Interview questions generated successfully.",
      questions: updatedResume.questions
    });
  } catch (error) {
    console.error("Interview questions generation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred compiling interview questions." },
      { status: 500 }
    );
  }
}
