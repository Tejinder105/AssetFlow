import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

/**
 * Generate a short-lived access token.
 * Payload should contain: { userId, role }
 * @param {object} payload
 * @returns {string} signed JWT
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRY,
    });
};

/**
 * Generate a long-lived refresh token.
 * Payload should contain: { userId }
 * @param {object} payload
 * @returns {string} signed JWT
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRY,
    });
};

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
