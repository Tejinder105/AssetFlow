import { ApiError } from "../utils/apierror.js";

const VERIFICATION_STATUSES = ["Verified", "Missing", "Damaged"];

const requireString = (value, fieldName, max = 150) => {
    if (!value || typeof value !== "string") throw new ApiError(400, `${fieldName} is required`);
    const trimmed = value.trim();
    if (!trimmed) throw new ApiError(400, `${fieldName} cannot be empty`);
    if (trimmed.length > max) throw new ApiError(400, `${fieldName} must be at most ${max} characters`);
    return trimmed;
};

const requireDate = (value, fieldName) => {
    if (!value) throw new ApiError(400, `${fieldName} is required`);
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new ApiError(400, `${fieldName} must be a valid date`);
    return d.toISOString();
};

const optionalInt = (value, fieldName) => {
    if (value === undefined || value === null || value === "") return undefined;
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) throw new ApiError(400, `${fieldName} must be a positive integer`);
    return n;
};

const optionalString = (value, fieldName, max = 255) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new ApiError(400, `${fieldName} must be a string`);
    return value.trim() || undefined;
};

// ── Create Cycle ───────────────────────────────────────────────
export const validateCreateCycle = (body) => {
    const name = requireString(body.name, "name");
    const startDate = requireDate(body.startDate, "startDate");
    const endDate = requireDate(body.endDate, "endDate");
    const scopeDepartmentId = optionalInt(body.scopeDepartmentId, "scopeDepartmentId");
    const scopeLocation = optionalString(body.scopeLocation, "scopeLocation", 150);

    if (new Date(startDate) >= new Date(endDate)) {
        throw new ApiError(400, "endDate must be after startDate");
    }

    return { name, startDate, endDate, scopeDepartmentId, scopeLocation };
};

// ── Assign Auditors ────────────────────────────────────────────
export const validateAssignAuditors = (body) => {
    if (!Array.isArray(body.auditorUserIds) || body.auditorUserIds.length === 0) {
        throw new ApiError(400, "auditorUserIds must be a non-empty array of user IDs");
    }

    const auditorUserIds = body.auditorUserIds.map((id) => {
        const n = parseInt(id, 10);
        if (isNaN(n) || n < 1) throw new ApiError(400, "Each auditorUserId must be a positive integer");
        return n;
    });

    return { auditorUserIds };
};

// ── Mark Item ──────────────────────────────────────────────────
export const validateMarkItem = (body) => {
    if (!body.verificationStatus || !VERIFICATION_STATUSES.includes(body.verificationStatus)) {
        throw new ApiError(400, `verificationStatus must be one of: ${VERIFICATION_STATUSES.join(", ")}`);
    }

    return {
        verificationStatus: body.verificationStatus,
        notes: optionalString(body.notes, "notes"),
    };
};
