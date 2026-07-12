import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication routes.
 * Prevents brute-force attacks on login/register endpoints.
 *
 * Limit: 20 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,    // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes.",
        errors: [],
    },
});
