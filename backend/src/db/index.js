import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

// Create the MySQL driver adapter
const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "assetflow",
});

// Create the Prisma client with the adapter
const prisma = new PrismaClient({ adapter });

/**
 * Test the database connection.
 * Called from src/index.js on startup.
 */
const connectDB = async () => {
    try {
        // Run a lightweight query to verify connectivity
        await prisma.$queryRaw`SELECT 1`;
        console.log(`\n✅ MySQL connected successfully via Prisma`);
    } catch (error) {
        console.error("❌ MySQL connection FAILED:", error);
        process.exit(1);
    }
};

export default connectDB;
export { prisma };
