/**
 * Custom API error class.
 * Thrown in services/controllers and caught by the centralized error handler.
 */
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Consistent JSON serialization for error responses.
     */
    toJSON() {
        return {
            success: false,
            message: this.message,
            errors: this.errors,
        };
    }
}

export { ApiError };