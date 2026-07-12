import { ApiError } from "../utils/apierror.js";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const requireInt = (value, fieldName) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) throw new ApiError(400, `${fieldName} must be a positive integer`);
    return n;
};

const requireString = (value, fieldName, max = 255) => {
    if (!value || typeof value !== "string") throw new ApiError(400, `${fieldName} is required`);
    const trimmed = value.trim();
    if (!trimmed) throw new ApiError(400, `${fieldName} cannot be empty`);
    if (trimmed.length > max) throw new ApiError(400, `${fieldName} must be at most ${max} characters`);
    return trimmed;
};

const optionalString = (value, fieldName, max = 500) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new ApiError(400, `${fieldName} must be a string`);
    return value.trim() || undefined;
};

// ── Raise Request ──────────────────────────────────────────────
export const validateRaiseRequest = (body) => {
    const assetId = requireInt(body.assetId, "assetId");
    const issueDescription = requireString(body.issueDescription, "issueDescription", 5000);
    let priority;
    if (body.priority) {
        if (!PRIORITIES.includes(body.priority)) {
            throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(", ")}`);
        }
        priority = body.priority;
    }
    const photoUrl = optionalString(body.photoUrl, "photoUrl");

    return { assetId, issueDescription, priority, photoUrl };
};

// ── Assign Technician ──────────────────────────────────────────
export const validateAssignTechnician = (body) => {
    const technicianName = requireString(body.technicianName, "technicianName", 150);
    return { technicianName };
};

// ── Resolve Request ────────────────────────────────────────────
export const validateResolve = (body) => {
    const resolutionNotes = optionalString(body.resolutionNotes, "resolutionNotes", 5000);
    return { resolutionNotes };
};
