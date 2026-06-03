import { PrismaClient } from "@prisma/client";

/**
 * Global object wrapper to prevent multiple Prisma client instances
 * in development environment due to hot module replacement (HMR).
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
const globalForPrisma = globalThis;

/**
 * Database client service instance.
 * Exported to be reused across all backend and API files.
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
