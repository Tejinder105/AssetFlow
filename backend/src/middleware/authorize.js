import { ApiError } from "../utils/apierror.js";

/**
 * Role-based authorization middleware.
 * Must be used AFTER the authenticate middleware (req.user must exist).
 *
 * Usage:
 *   authorize("Admin")
 *   authorize("Admin", "AssetManager")
 *   authorize("Admin", "AssetManager", "DepartmentHead")
 *
 * @param  {...string} allowedRoles - One or more UserRole enum values
 * @returns {import("express").RequestHandler}
 */
export const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication is required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You do not have permission to perform this action"
            );
        }

        next();
    };
};
