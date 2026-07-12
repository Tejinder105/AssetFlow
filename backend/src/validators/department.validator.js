import { ApiError } from "../utils/apierror.js";

const DEPARTMENT_STATUSES = ["Active", "Inactive"];

const asOptionalTrimmedString = (value, fieldName, max = 150) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== "string") {
        throw new ApiError(400, `${fieldName} must be a string`);
    }

    const trimmed = value.trim();
    if (!trimmed) {
        throw new ApiError(400, `${fieldName} cannot be empty`);
    }

    if (trimmed.length > max) {
        throw new ApiError(400, `${fieldName} must be at most ${max} characters`);
    }

    return trimmed;
};

const asOptionalPositiveInt = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ApiError(400, `${fieldName} must be a positive integer`);
    }

    return parsed;
};

export const validateCreateDepartment = (body) => {
    const name = asOptionalTrimmedString(body.name, "name");
    if (!name) {
        throw new ApiError(400, "name is required");
    }

    const parentDepartmentId = asOptionalPositiveInt(body.parentDepartmentId, "parentDepartmentId");
    const headUserId = asOptionalPositiveInt(body.headUserId, "headUserId");

    return {
        name,
        ...(parentDepartmentId !== undefined ? { parentDepartmentId } : {}),
        ...(headUserId !== undefined ? { headUserId } : {}),
    };
};

export const validateUpdateDepartment = (body) => {
    const payload = {};

    const name = asOptionalTrimmedString(body.name, "name");
    if (name !== undefined) {
        payload.name = name;
    }

    if (body.parentDepartmentId === null) {
        payload.parentDepartmentId = null;
    } else {
        const parentDepartmentId = asOptionalPositiveInt(body.parentDepartmentId, "parentDepartmentId");
        if (parentDepartmentId !== undefined) {
            payload.parentDepartmentId = parentDepartmentId;
        }
    }

    if (body.headUserId === null) {
        payload.headUserId = null;
    } else {
        const headUserId = asOptionalPositiveInt(body.headUserId, "headUserId");
        if (headUserId !== undefined) {
            payload.headUserId = headUserId;
        }
    }

    if (Object.keys(payload).length === 0) {
        throw new ApiError(400, "At least one field is required to update department");
    }

    return payload;
};

export const validateDepartmentStatusPatch = (body) => {
    const status = body.status || "Inactive";

    if (!DEPARTMENT_STATUSES.includes(status)) {
        throw new ApiError(400, `status must be one of: ${DEPARTMENT_STATUSES.join(", ")}`);
    }

    return { status };
};

export const validateDepartmentListQuery = (query) => {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 20 : Number(query.limit);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "page must be an integer greater than or equal to 1");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new ApiError(400, "limit must be an integer between 1 and 100");
    }

    const validated = {
        page,
        limit,
    };

    if (query.search !== undefined) {
        validated.search = asOptionalTrimmedString(query.search, "search", 150);
    }

    if (query.status !== undefined) {
        if (!DEPARTMENT_STATUSES.includes(query.status)) {
            throw new ApiError(400, `status must be one of: ${DEPARTMENT_STATUSES.join(", ")}`);
        }
        validated.status = query.status;
    }

    const parentDepartmentId = asOptionalPositiveInt(query.parentDepartmentId, "parentDepartmentId");
    if (parentDepartmentId !== undefined) {
        validated.parentDepartmentId = parentDepartmentId;
    }

    return validated;
};
