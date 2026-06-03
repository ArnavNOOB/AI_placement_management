import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Main NextAuth handler function configured with database options.
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
