import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * NextAuth Configuration Options
 * Set up credentials-based authentication, hashing validation, and role session mapping.
 * 
 * @type {import('next-auth').NextAuthOptions}
 * @author Arnav Garg
 * @version 1.0.0
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      /**
       * Authorizes a credentials sign-in request.
       * Compares email and decrypts password hash.
       * 
       * @param {Object} credentials Email and password inputs
       * @returns {Promise<Object|null>} The user object if authenticated, or null
       * @author Arnav Garg
       * @version 1.0.0
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials format");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    /**
     * Map user attributes into the JWT token on login.
     * 
     * @param {Object} params JWT parameters containing token and user info
     * @returns {Promise<Object>} Augmented JWT token
     * @author Arnav Garg
     * @version 1.0.0
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    /**
     * Map token attributes to the session object.
     * 
     * @param {Object} params Session parameters containing session and token
     * @returns {Promise<Object>} Augmented Session object
     * @author Arnav Garg
     * @version 1.0.0
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
};
