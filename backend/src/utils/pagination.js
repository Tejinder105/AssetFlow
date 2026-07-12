/**
 * Shared pagination helper.
 * Parses page/limit from query params and returns Prisma skip/take.
 *
 * @param {object} query - Express req.query
 * @param {number} [defaultLimit=20] - Default items per page
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
export const parsePagination = (query, defaultLimit = 20) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
};

/**
 * Build a standard paginated response object.
 *
 * @param {Array} data - Array of records
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object}
 */
export const paginatedResponse = (data, total, page, limit) => ({
    data,
    pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    },
});
