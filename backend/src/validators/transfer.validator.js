import { ApiError } from "../utils/apierror.js";

const requireInt = (value, fieldName) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) throw new ApiError(400, `${fieldName} must be a positive integer`);
    return n;
};

const optionalString = (value, fieldName, max = 255) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new ApiError(400, `${fieldName} must be a string`);
    const trimmed = value.trim();
    if (trimmed.length > max) throw new ApiError(400, `${fieldName} must be at most ${max} characters`);
    return trimmed || undefined;
};

// ── Request Transfer Schema ────────────────────────────────────
export const validateRequestTransfer = (body) => {
    const assetId = requireInt(body.assetId, "assetId");
    const requestedToUserId = requireInt(body.requestedToUserId, "requestedToUserId");
    const reason = optionalString(body.reason, "reason");

    return { assetId, requestedToUserId, reason };
};

// ── Approve/Reject Schema ──────────────────────────────────────
export const validateApproveReject = (body) => {
    return {
        reason: optionalString(body.reason, "reason"),
    };
};
