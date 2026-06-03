const { PrismaClient } = require("@prisma/client");
try {
  require("dotenv").config();
} catch (e) {
  // Fallback if dotenv package is not globally present
}

const prisma = new PrismaClient();

/**
 * Diagnostic runner for Prisma database connections.
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
async function diagnose() {
  console.log("=========================================");
  console.log("PlacementAI Database Diagnostic");
  console.log("=========================================");
  console.log("Environment DATABASE_URL:", process.env.DATABASE_URL ? "Defined (Hidden for privacy)" : "UNDEFINED");
  
  try {
    console.log("\nAttempting to connect to MongoDB...");
    await prisma.$connect();
    console.log("✅ Success: Established raw database connection.");

    console.log("\nTesting simple query (user count)...");
    const count = await prisma.user.count();
    console.log(`✅ Success: Queried user collection. Total Users: ${count}`);
    
    console.log("\nTesting write compatibility (creating a temporary test record)...");
    const tempUser = await prisma.user.create({
      data: {
        name: "Connection Test",
        email: `temp-${Date.now()}@test.com`,
        password: "temp",
        role: "STUDENT"
      }
    });
    console.log("✅ Success: Wrote temporary document to database.");

    console.log("\nCleaning up test record...");
    await prisma.user.delete({
      where: { id: tempUser.id }
    });
    console.log("✅ Success: Deleted temporary document.");
    console.log("\n🎉 Diagnostic Result: MongoDB is fully connected, authorized, and supports writes!");

  } catch (error) {
    console.error("\n❌ DIAGNOSTIC FAILURE:");
    console.error("Error Name:", error.name);
    console.error("Error Code (Prisma):", error.code || "None");
    console.error("Message:\n", error.message);
    
    console.log("\n💡 Potential Solutions:");
    if (error.message.includes("replica set") || error.message.includes("ReplicaSet")) {
      console.log("👉 MongoDB must be run as a Replica Set. If using local MongoDB, make sure you initialized it with 'rs.initiate()'. If using MongoDB Atlas (cloud), replica sets are handled automatically.");
    } else if (error.message.includes("Authentication failed") || error.message.includes("auth failed")) {
      console.log("👉 The username or password in your DATABASE_URL is incorrect. Make sure you replaced '<db_password>' with your actual database user password (not your MongoDB account login password).");
    } else if (error.message.includes("ECONNREFUSED") || error.message.includes("connect")) {
      console.log("👉 MongoDB database server is not running on the specified port. Check if your database daemon is active.");
    }
  } finally {
    await prisma.$disconnect();
    console.log("=========================================");
  }
}

diagnose();
