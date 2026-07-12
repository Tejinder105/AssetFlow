/**
 * Centralized environment configuration.
 * All env vars are accessed through this module for consistency.
 */
import "dotenv/config";

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "8000", 10),

    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

    JWT_ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET,
    JWT_REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,

    get isProduction() {
        return this.NODE_ENV === "production";
    },
};

export default env;
