import env from "../config/env.config.js";

const COOKIE_NAME = "refreshToken";

/**
 * Set the refresh token as an HttpOnly cookie.
 * @param {import("express").Response} res
 * @param {string} token - The refresh token JWT
 */
export const setRefreshTokenCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,                        // Not accessible via JS
        secure: env.isProduction,              // HTTPS only in production
        sameSite: "Lax",                       // CSRF protection
        maxAge: env.REFRESH_TOKEN_EXPIRY_MS,   // 7 days
        path: "/",
    });
};

/**
 * Clear the refresh token cookie.
 * @param {import("express").Response} res
 */
export const clearRefreshTokenCookie = (res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "Lax",
        path: "/",
    });
};
