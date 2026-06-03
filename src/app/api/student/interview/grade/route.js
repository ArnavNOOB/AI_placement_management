import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { geminiService } from "@/lib/gemini";

/**
 * Handle POST request to evaluate a practice interview response.
 * Passes the question and response string to the AI engine (Gemini/Mock)
 * to output dynamic grades and constructive reviews.
 * 
 * @param {Request} req Request object containing question and answer strings
 * @returns {Promise<Response>} NextResponse containing score and feedback
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

    const body = await req.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer text fields are required." },
        { status: 400 }
      );
    }

    // Call grading evaluator
    const result = await geminiService.gradeAnswer(question, answer);

    return NextResponse.json({
      success: true,
      score: result.score,
      feedback: result.feedback
    });
  } catch (error) {
    console.error("Evaluation grading API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during answer evaluation." },
      { status: 500 }
    );
  }
}
