/**
 * Centralized environment configuration.
 * All env vars are accessed through this module for consistency.
 */

const env = {
    // ── Node ───────────────────────────────────────────
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "8000", 10),

    // ── CORS ───────────────────────────────────────────
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

    // ── JWT ────────────────────────────────────────────
    JWT_ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET,
    JWT_REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: "15m",    // 15 minutes
    REFRESH_TOKEN_EXPIRY: "7d",    // 7 days
    REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

    // ── Helpers ────────────────────────────────────────
    get isProduction() {
        return this.NODE_ENV === "production";
    },
};

export default env;
