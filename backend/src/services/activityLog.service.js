import { prisma } from "../db/index.js";

// ────────────────────────────────────────────────────────────────
// LOG (internal — used by other services and middleware)
// ────────────────────────────────────────────────────────────────
/**
 * Create an activity log entry.
 * @param {object} params
 * @param {number} [params.userId]
 * @param {string} params.action - e.g. "ASSET_CREATED", "ALLOCATION_RETURNED"
 * @param {string} [params.entityType] - e.g. "asset", "allocation"
 * @param {number} [params.entityId]
 * @param {object} [params.details] - JSON details
 * @param {string} [params.ipAddress]
 */
export const log = async ({ userId, action, entityType, entityId, details, ipAddress }) => {
    return prisma.activityLog.create({
        data: {
            userId: userId || null,
            action,
            entityType: entityType || null,
            entityId: entityId || null,
            details: details || undefined,
            ipAddress: ipAddress || null,
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LIST LOGS
// ────────────────────────────────────────────────────────────────
export const listLogs = async (filters, { skip, take }) => {
    const where = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = parseInt(filters.entityId, 10);
    if (filters.userId) where.userId = parseInt(filters.userId, 10);
    if (filters.action) where.action = { contains: filters.action };

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { userId: true, name: true, email: true } },
            },
        }),
        prisma.activityLog.count({ where }),
    ]);

    return { logs, total };
};
