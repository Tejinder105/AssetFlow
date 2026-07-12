import { ApiError } from "../utils/apierror.js";

const requireInt = (value, fieldName) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) throw new ApiError(400, `${fieldName} must be a positive integer`);
    return n;
};

const optionalInt = (value, fieldName) => {
    if (value === undefined || value === null || value === "") return undefined;
    return requireInt(value, fieldName);
};

const requireDatetime = (value, fieldName) => {
    if (!value) throw new ApiError(400, `${fieldName} is required`);
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new ApiError(400, `${fieldName} must be a valid date/time`);
    return d.toISOString();
};

const optionalString = (value, fieldName, max = 255) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new ApiError(400, `${fieldName} must be a string`);
    const trimmed = value.trim();
    if (trimmed.length > max) throw new ApiError(400, `${fieldName} must be at most ${max} characters`);
    return trimmed || undefined;
};

// ── Create Booking ─────────────────────────────────────────────
export const validateCreateBooking = (body) => {
    const assetId = requireInt(body.assetId, "assetId");
    const startTime = requireDatetime(body.startTime, "startTime");
    const endTime = requireDatetime(body.endTime, "endTime");
    const departmentId = optionalInt(body.departmentId, "departmentId");

    return { assetId, startTime, endTime, departmentId };
};

// ── Reschedule Booking ─────────────────────────────────────────
export const validateReschedule = (body) => {
    const startTime = requireDatetime(body.startTime, "startTime");
    const endTime = requireDatetime(body.endTime, "endTime");

    return { startTime, endTime };
};

// ── Cancel Booking ─────────────────────────────────────────────
export const validateCancel = (body) => {
    return {
        cancelledReason: optionalString(body.cancelledReason, "cancelledReason"),
    };
};
