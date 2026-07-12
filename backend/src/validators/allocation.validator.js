import { ApiError } from "../utils/apierror.js";

// ── Helpers ────────────────────────────────────────────────────
const requireInt = (value, fieldName) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) throw new ApiError(400, `${fieldName} must be a positive integer`);
    return n;
};

const optionalInt = (value, fieldName) => {
    if (value === undefined || value === null || value === "") return undefined;
    return requireInt(value, fieldName);
};

const optionalString = (value, fieldName, max = 255) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new ApiError(400, `${fieldName} must be a string`);
    const trimmed = value.trim();
    if (trimmed.length > max) throw new ApiError(400, `${fieldName} must be at most ${max} characters`);
    return trimmed || undefined;
};

// ── Allocate Schema ────────────────────────────────────────────
export const validateAllocate = (body) => {
    const assetId = requireInt(body.assetId, "assetId");
    const allocatedToUserId = optionalInt(body.allocatedToUserId, "allocatedToUserId");
    const allocatedToDepartmentId = optionalInt(body.allocatedToDepartmentId, "allocatedToDepartmentId");

    if (!allocatedToUserId && !allocatedToDepartmentId) {
        throw new ApiError(400, "Either allocatedToUserId or allocatedToDepartmentId is required");
    }

    let expectedReturnDate;
    if (body.expectedReturnDate) {
        expectedReturnDate = new Date(body.expectedReturnDate);
        if (isNaN(expectedReturnDate.getTime())) throw new ApiError(400, "Invalid expectedReturnDate");
    }

    return { assetId, allocatedToUserId, allocatedToDepartmentId, expectedReturnDate };
};

// ── Return Schema ──────────────────────────────────────────────
export const validateReturn = (body) => {
    return {
        returnConditionNotes: optionalString(body.returnConditionNotes, "returnConditionNotes", 1000),
    };
};
