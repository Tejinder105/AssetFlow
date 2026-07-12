import { ApiError } from "../utils/apierror.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { prisma } from "../db/index.js";

/**
 * Authentication middleware.
 * Verifies the Bearer token from the Authorization header or cookies.
 * Attaches the authenticated user to req.user.
 */
export const authenticate = async (req, _res, next) => {
    try {
        // Extract token from Authorization header or cookies
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Access token is required");
        }

        // Verify JWT
        const decoded = verifyAccessToken(token);

        // Fetch user from database (exclude sensitive fields)
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
            select: {
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
            },
        });

        if (!user) {
            throw new ApiError(401, "User associated with this token no longer exists");
        }

        if (user.status !== "Active") {
            throw new ApiError(403, "Your account has been deactivated");
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        // Re-throw ApiError instances as-is
        if (error instanceof ApiError) {
            return next(error);
        }

        // Handle JWT-specific errors
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Access token has expired"));
        }
        if (error.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Invalid access token"));
        }

        return next(new ApiError(401, "Authentication failed"));
    }
};
