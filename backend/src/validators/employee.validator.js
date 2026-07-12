import { ApiError } from "../utils/apierror.js";

const USER_ROLES = ["Admin", "AssetManager", "DepartmentHead", "Employee"];
const USER_STATUSES = ["Active", "Inactive"];

const trimString = (value, fieldName, maxLength) => {
    if (typeof value !== "string") {
        throw new ApiError(400, `${fieldName} must be a string`);
    }

    const trimmed = value.trim();
    if (!trimmed) {
        throw new ApiError(400, `${fieldName} cannot be empty`);
    }

    if (trimmed.length > maxLength) {
        throw new ApiError(400, `${fieldName} must be at most ${maxLength} characters`);
    }

    return trimmed;
};

const positiveInt = (value, fieldName) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ApiError(400, `${fieldName} must be a positive integer`);
    }
    return parsed;
};

export const validateEmployeeListQuery = (query) => {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 20 : Number(query.limit);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiError(400, "page must be an integer greater than or equal to 1");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new ApiError(400, "limit must be an integer between 1 and 100");
    }

    const payload = { page, limit };

    if (query.search !== undefined) {
        payload.search = trimString(query.search, "search", 150);
    }

    if (query.departmentId !== undefined) {
        payload.departmentId = positiveInt(query.departmentId, "departmentId");
    }

    if (query.role !== undefined) {
        if (!USER_ROLES.includes(query.role)) {
            throw new ApiError(400, `role must be one of: ${USER_ROLES.join(", ")}`);
        }
        payload.role = query.role;
    }

    if (query.status !== undefined) {
        if (!USER_STATUSES.includes(query.status)) {
            throw new ApiError(400, `status must be one of: ${USER_STATUSES.join(", ")}`);
        }
        payload.status = query.status;
    }

    return payload;
};

export const validateUpdateEmployee = (body) => {
    const payload = {};

    if (body.name !== undefined) {
        payload.name = trimString(body.name, "name", 150);
    }

    if (body.email !== undefined) {
        payload.email = trimString(body.email, "email", 150).toLowerCase();
    }

    if (body.departmentId !== undefined) {
        payload.departmentId = body.departmentId === null ? null : positiveInt(body.departmentId, "departmentId");
    }

    if (body.status !== undefined) {
        if (!USER_STATUSES.includes(body.status)) {
            throw new ApiError(400, `status must be one of: ${USER_STATUSES.join(", ")}`);
        }
        payload.status = body.status;
    }

    if (body.password !== undefined) {
        payload.password = trimString(body.password, "password", 200);
    }

    if (body.role !== undefined) {
        throw new ApiError(400, "Use the role promotion endpoint to change employee roles");
    }

    if (Object.keys(payload).length === 0) {
        throw new ApiError(400, "At least one field is required to update employee");
    }

    return payload;
};

export const validatePromoteRole = (body) => {
    if (!body.role) {
        throw new ApiError(400, "role is required");
    }

    if (!USER_ROLES.includes(body.role)) {
        throw new ApiError(400, `role must be one of: ${USER_ROLES.join(", ")}`);
    }

    return { role: body.role };
};

export const validateEmployeeIdParam = (value) => {
    return positiveInt(value, "employee id");
};
