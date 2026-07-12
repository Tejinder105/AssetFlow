import { z } from "zod/v4";
import { ApiError } from "../utils/apierror.js";

// ── Registration Schema ────────────────────────────────────────
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(150, "Name must be at most 150 characters")
            .trim(),
        email: z
            .email("Invalid email address")
            .max(150, "Email must be at most 150 characters")
            .transform((v) => v.toLowerCase().trim()),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must be at most 128 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// ── Login Schema ───────────────────────────────────────────────
export const loginSchema = z.object({
    email: z
        .email("Invalid email address")
        .transform((v) => v.toLowerCase().trim()),
    password: z.string().min(1, "Password is required"),
});

// ── Validation Middleware Factory ───────────────────────────────
/**
 * Creates an Express middleware that validates req.body against
 * the given Zod schema. On failure, throws an ApiError with
 * structured validation errors.
 *
 * @param {z.ZodSchema} schema
 * @returns {import("express").RequestHandler}
 */
export const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            throw new ApiError(422, "Validation failed", errors);
        }

        // Replace req.body with the parsed/transformed data
        req.body = result.data;
        next();
    };
};
