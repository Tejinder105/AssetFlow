/**
 * Standard API response wrapper.
 * Used by controllers to return consistent success responses.
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    /**
     * Consistent JSON serialization for success responses.
     */
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
        };
    }
}

export { ApiResponse };