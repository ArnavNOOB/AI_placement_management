import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiService } from "@/lib/gemini";
import fs from "fs";
import path from "path";

/**
 * Parses printable text characters directly from raw file buffer
 * to act as a fallback text extractor for PDF files.
 * 
 * @param {Buffer} buffer Raw file buffer
 * @returns {string} Cleaned text string of printable characters
 * @author Arnav Garg
 * @version 1.0.0
 */
function extractPrintableText(buffer) {
  let text = "";
  for (let i = 0; i < buffer.length; i++) {
    const charCode = buffer[i];
    if (
      (charCode >= 32 && charCode <= 126) ||
      charCode === 10 ||
      charCode === 13 ||
      charCode === 9
    ) {
      text += String.fromCharCode(charCode);
    }
  }
  
  return text
    .replace(/\/[\w]+/g, " ")
    .replace(/\([\w\s-]+\)/g, " ")
    .replace(/[^a-zA-Z0-9\s.,;:()#@-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Handle POST request to upload a student resume.
 * Verifies session role, extracts file, writes locally, triggers Gemini analysis,
 * and saves or updates the resume entry in MongoDB.
 * 
 * @param {Request} req Request containing file Form FormData
 * @returns {Promise<Response>} NextResponse with analysis details or error logs
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized access. Only students can upload resumes." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    // Ensure it's a PDF
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF resumes are supported." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${session.user.id}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Extract text from the binary file buffer
    let rawText = extractPrintableText(buffer);
    rawText += `\n\n[Metadata] Candidate Name: ${session.user.name}\nCandidate Email: ${session.user.email}\nFile Name: ${file.name}`;

    // Run AI Resume Analysis
    const analysis = await geminiService.analyzeResume(rawText);

    // Upsert the resume in MongoDB
    const resume = await prisma.resume.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        fileUrl,
        atsScore: analysis.atsScore,
        skills: analysis.skills,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        recommendedRoles: analysis.recommendedRoles,
      },
      create: {
        userId: session.user.id,
        fileUrl,
        atsScore: analysis.atsScore,
        skills: analysis.skills,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        recommendedRoles: analysis.recommendedRoles,
      },
    });

    return NextResponse.json({
      message: "Resume uploaded and analyzed successfully.",
      resume,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during resume upload and analysis." },
      { status: 500 }
    );
  }
}
