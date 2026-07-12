import { ApiError } from "../utils/apierror.js";
import env from "../config/env.config.js";

/**
 * Centralized error handling middleware.
 * Catches all errors thrown in controllers/services and returns
 * a consistent JSON response.
 *
 * Must be registered LAST in the Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    // ── Known ApiError ─────────────────────────────────────────
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }

    // ── Zod Validation Error ───────────────────────────────────
    if (err.name === "ZodError") {
        const errors = err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // ── JWT Errors ─────────────────────────────────────────────
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired",
            errors: [],
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
            errors: [],
        });
    }

    // ── Prisma Known Errors ────────────────────────────────────
    if (err.code === "P2002") {
        // Unique constraint violation
        const field = err.meta?.target?.[0] || "field";
        return res.status(409).json({
            success: false,
            message: `A record with this ${field} already exists`,
            errors: [],
        });
    }

    // ── Fallback: Unknown Error ────────────────────────────────
    console.error("❌ Unhandled Error:", err);

    return res.status(500).json({
        success: false,
        message: env.isProduction
            ? "Internal server error"
            : err.message || "Internal server error",
        errors: [],
    });
};

export { errorHandler };
