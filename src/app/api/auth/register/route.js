import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Handle POST request for registering a new user.
 * Validates inputs, hashes password, check for duplicate emails, and saves user to database.
 * 
 * @param {Request} req Request object containing user registration details
 * @returns {Promise<Response>} NextResponse indicating success or failure status
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields (name, email, password, role) are required." },
        { status: 400 }
      );
    }

    const uppercaseRole = role.toUpperCase();
    if (!["STUDENT", "RECRUITER", "PLACEMENT_OFFICER"].includes(uppercaseRole)) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );
    }

    // Check duplicate user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to MongoDB
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: uppercaseRole
      }
    });

    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
