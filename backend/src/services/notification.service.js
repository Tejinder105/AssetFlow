import { prisma } from "../db/index.js";

// ────────────────────────────────────────────────────────────────
// NOTIFY (internal — used by other services)
// ────────────────────────────────────────────────────────────────
/**
 * Create a notification for a user.
 * @param {number} userId
 * @param {string} type - e.g. "allocation", "transfer", "maintenance"
 * @param {string} title
 * @param {string} [message]
 * @param {string} [relatedEntityType]
 * @param {number} [relatedEntityId]
 */
export const notify = async (userId, type, title, message, relatedEntityType, relatedEntityId) => {
    return prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message: message || null,
            relatedEntityType: relatedEntityType || null,
            relatedEntityId: relatedEntityId || null,
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LIST NOTIFICATIONS
// ────────────────────────────────────────────────────────────────
export const listNotifications = async (userId, filters, { skip, take }) => {
    const where = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.isRead !== undefined) where.isRead = filters.isRead === "true";

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
        }),
        prisma.notification.count({ where }),
    ]);

    return { notifications, total };
};

// ────────────────────────────────────────────────────────────────
// MARK READ
// ────────────────────────────────────────────────────────────────
export const markRead = async (notificationId, userId) => {
    const notif = await prisma.notification.findUnique({
        where: { notificationId },
    });

    if (!notif || notif.userId !== userId) {
        const { ApiError } = await import("../utils/apierror.js");
        throw new ApiError(404, "Notification not found");
    }

    return prisma.notification.update({
        where: { notificationId },
        data: { isRead: true },
    });
};

// ────────────────────────────────────────────────────────────────
// UNREAD COUNT
// ────────────────────────────────────────────────────────────────
export const getUnreadCount = async (userId) => {
    return prisma.notification.count({
        where: { userId, isRead: false },
    });
};
