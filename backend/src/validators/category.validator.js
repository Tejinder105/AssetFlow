import { ApiError } from "../utils/apierror.js";

const FIELD_TYPES = ["text", "number", "date", "boolean"];

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

const optionalTrimString = (value, fieldName, maxLength) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    return trimString(value, fieldName, maxLength);
};

const positiveInt = (value, fieldName) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ApiError(400, `${fieldName} must be a positive integer`);
    }
    return parsed;
};

export const validateCreateCategory = (body) => {
    const name = trimString(body.name, "name", 100);
    const payload = { name };

    const description = optionalTrimString(body.description, "description", 5000);
    if (description !== undefined) {
        payload.description = description;
    }

    return payload;
};

export const validateUpdateCategory = (body) => {
    const payload = {};

    if (body.name !== undefined) {
        payload.name = trimString(body.name, "name", 100);
    }

    if (body.description !== undefined) {
        if (body.description === null || body.description === "") {
            payload.description = null;
        } else {
            payload.description = trimString(body.description, "description", 5000);
        }
    }

    if (Object.keys(payload).length === 0) {
        throw new ApiError(400, "At least one field is required to update category");
    }

    return payload;
};

export const validateAddCategoryField = (body) => {
    const fieldName = trimString(body.fieldName, "fieldName", 100);
    const fieldType = body.fieldType || "text";

    if (!FIELD_TYPES.includes(fieldType)) {
        throw new ApiError(400, `fieldType must be one of: ${FIELD_TYPES.join(", ")}`);
    }

    const payload = {
        fieldName,
        fieldType,
    };

    if (body.isRequired !== undefined) {
        const normalized = body.isRequired;
        if (typeof normalized === "boolean") {
            payload.isRequired = normalized;
        } else if (normalized === "true" || normalized === "false") {
            payload.isRequired = normalized === "true";
        } else {
            throw new ApiError(400, "isRequired must be boolean");
        }
    }

    return payload;
};

export const validateCategoryListQuery = (query) => {
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
        payload.search = optionalTrimString(query.search, "search", 100);
    }

    return payload;
};

export const validateCategoryFieldListQuery = (query) => {
    const payload = {};

    if (query.includeUsage !== undefined) {
        payload.includeUsage = query.includeUsage === "true" || query.includeUsage === true;
    }

    return payload;
};

export const validateCategoryIdParam = (value) => {
    return positiveInt(value, "category id");
};

export const validateFieldIdParam = (value) => {
    return positiveInt(value, "field id");
};
