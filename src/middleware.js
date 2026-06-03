import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route protection middleware using NextAuth JWT checking.
 * Restricts subpaths of student, recruiter, and placement officer dashboards
 * by matching the user's logged-in token role.
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
export default withAuth(
  /**
   * Middleware routing validator callback.
   * 
   * @param {Object} req The Next.js request wrapper containing auth tokens
   * @author Arnav Garg
   * @version 1.0.0
   */
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check student protection
    if (path.startsWith("/student") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check recruiter protection
    if (path.startsWith("/recruiter") && token?.role !== "RECRUITER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check placement officer protection
    if (path.startsWith("/officer") && token?.role !== "PLACEMENT_OFFICER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      /**
       * Determines if a user is authorized to bypass main route checks.
       * 
       * @param {Object} params Object containing request token
       * @returns {boolean} Boolean indicating if a token exists
       */
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/student/:path*",
    "/recruiter/:path*",
    "/officer/:path*",
  ],
};
