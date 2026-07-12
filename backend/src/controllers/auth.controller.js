import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import {
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
} from "../utils/cookie.utils.js";
import * as authService from "../services/auth.service.js";

// ────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    await authService.registerUser({ name, email, password });

    res.status(201).json(
        new ApiResponse(201, null, "User registered successfully")
    );
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await authService.loginUser({
        email,
        password,
    });

    // Set refresh token in HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json(
        new ApiResponse(200, { accessToken, user }, "Logged in successfully")
    );
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ────────────────────────────────────────────────────────────────
export const refresh = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken;

    if (!incomingToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    const { accessToken, refreshToken } = await authService.refreshSession(
        incomingToken
    );

    // Set the new rotated refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json(
        new ApiResponse(200, { accessToken }, "Token refreshed successfully")
    );
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    await authService.logoutUser(refreshToken);

    // Clear the cookie regardless
    clearRefreshTokenCookie(res);

    res.status(200).json(
        new ApiResponse(200, null, "Logged out successfully")
    );
});

// ────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────────
export const me = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, { user }, "Current user fetched successfully")
    );
});
