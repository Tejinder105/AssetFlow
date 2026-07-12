import { ApiError } from "../utils/apierror.js";

const normalizeRole = (role) => String(role || "").replace(/\s+/g, "").toLowerCase();

const roleAliases = {
    admin: "admin",
    assetmanager: "assetmanager",
    departmenthead: "departmenthead",
    employee: "employee",
};

const mapRole = (role) => roleAliases[normalizeRole(role)] || normalizeRole(role);

export const requireRole = (...allowedRoles) => {
    const normalizedAllowed = allowedRoles.map(mapRole);

    return (req, _res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        const current = mapRole(req.user.role);
        if (!normalizedAllowed.includes(current)) {
            return next(new ApiError(403, "Forbidden: insufficient role permissions"));
        }

        next();
    };
};
