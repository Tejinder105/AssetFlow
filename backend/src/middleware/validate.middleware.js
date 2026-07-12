import { ApiError } from "../utils/apierror.js";

export const validate = (validator, source = "body") => {
    return (req, _res, next) => {
        try {
            const payload = req[source] || {};
            const validated = validator(payload);
            Object.defineProperty(req, source, {
                value: validated,
                writable: true,
                enumerable: true,
                configurable: true
            });
            next();
        } catch (error) {
            if (error instanceof ApiError) {
                return next(error);
            }
            return next(new ApiError(400, error.message || "Validation failed"));
        }
    };
};
