import bcrypt from "bcrypt";
import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";
import env from "../config/env.config.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt.utils.js";

// ── Shared select object — never return passwordHash ───────────
const USER_SAFE_SELECT = {
    userId: true,
    name: true,
    email: true,
    role: true,
    status: true,
    departmentId: true,
    department: {
        select: {
            departmentId: true,
            name: true,
        },
    },
    createdAt: true,
    updatedAt: true,
};

// ────────────────────────────────────────────────────────────────
// REGISTER
// ────────────────────────────────────────────────────────────────
/**
 * Register a new user.
 * - Checks for duplicate email.
 * - Hashes password.
 * - Creates user with default role (Employee) from schema.
 * - Does NOT auto-login.
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<void>}
 */
export const registerUser = async ({ name, email, password }) => {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError(409, "A user with this email already exists");
    }

    // Hash password (salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user — role defaults to "Employee" via Prisma schema
    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────────────────────────
/**
 * Authenticate a user and create a session.
 * - Validates credentials.
 * - Checks user is active.
 * - Generates access + refresh tokens.
 * - Stores refresh token in Session table.
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
export const loginUser = async ({ email, password }) => {
    // Find user by email (need passwordHash for comparison)
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            ...USER_SAFE_SELECT,
            passwordHash: true, // need this temporarily for comparison
        },
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check if user account is active
    if (user.status !== "Active") {
        throw new ApiError(403, "Your account has been deactivated. Contact an administrator.");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
        userId: user.userId,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        userId: user.userId,
    });

    // Calculate refresh token expiry date
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY_MS);

    // Store refresh token as a session in the database
    await prisma.session.create({
        data: {
            userId: user.userId,
            token: refreshToken,
            expiresAt,
        },
    });

    // Build sanitized user object (strip passwordHash)
    const { passwordHash: _, ...sanitizedUser } = user;

    return {
        accessToken,
        refreshToken,
        user: sanitizedUser,
    };
};

// ────────────────────────────────────────────────────────────────
// REFRESH SESSION
// ────────────────────────────────────────────────────────────────
/**
 * Rotate the refresh token and issue a new access token.
 * - Verifies the incoming refresh token JWT.
 * - Finds the matching session in the database.
 * - Deletes the old session (rotation).
 * - Creates a new session with a new refresh token.
 *
 * @param {string} incomingRefreshToken
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export const refreshSession = async (incomingRefreshToken) => {
    // Step 1: Verify the JWT signature and expiry
    let decoded;
    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Step 2: Find the session that matches this exact token
    const existingSession = await prisma.session.findUnique({
        where: { token: incomingRefreshToken },
    });

    if (!existingSession) {
        // Token reuse detected — possible token theft.
        // Invalidate ALL sessions for this user as a precaution.
        await prisma.session.deleteMany({
            where: { userId: decoded.userId },
        });
        throw new ApiError(401, "Refresh token has been revoked. Please log in again.");
    }

    // Step 3: Check if the session has expired in the DB
    if (new Date() > existingSession.expiresAt) {
        await prisma.session.delete({ where: { sessionId: existingSession.sessionId } });
        throw new ApiError(401, "Refresh token has expired. Please log in again.");
    }

    // Step 4: Verify the user still exists and is active
    const user = await prisma.user.findUnique({
        where: { userId: decoded.userId },
        select: { userId: true, role: true, status: true },
    });

    if (!user || user.status !== "Active") {
        await prisma.session.delete({ where: { sessionId: existingSession.sessionId } });
        throw new ApiError(401, "User account not found or inactive");
    }

    // Step 5: Rotate — delete old session, create new one
    const newAccessToken = generateAccessToken({
        userId: user.userId,
        role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
        userId: user.userId,
    });

    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY_MS);

    // Delete old session and create new one in a transaction
    await prisma.$transaction([
        prisma.session.delete({ where: { sessionId: existingSession.sessionId } }),
        prisma.session.create({
            data: {
                userId: user.userId,
                token: newRefreshToken,
                expiresAt,
            },
        }),
    ]);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

// ────────────────────────────────────────────────────────────────
// LOGOUT
// ────────────────────────────────────────────────────────────────
/**
 * Destroy the session associated with the given refresh token.
 *
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
export const logoutUser = async (refreshToken) => {
    if (!refreshToken) return;

    // Delete the session — silently ignore if not found
    await prisma.session.deleteMany({
        where: { token: refreshToken },
    });
};

// ────────────────────────────────────────────────────────────────
// GET CURRENT USER
// ────────────────────────────────────────────────────────────────
/**
 * Fetch the authenticated user's profile.
 *
 * @param {number} userId
 * @returns {Promise<object>} sanitized user
 */
export const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { userId },
        select: USER_SAFE_SELECT,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};
