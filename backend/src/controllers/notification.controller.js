import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as notificationService from "../services/notification.service.js";

// GET /api/notifications
export const listNotifications = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { notifications, total } = await notificationService.listNotifications(
        req.user.userId,
        req.query,
        pagination
    );

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(notifications, total, pagination.page, pagination.limit), "Notifications fetched")
    );
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
    const notificationId = parseInt(req.params.id, 10);
    await notificationService.markRead(notificationId, req.user.userId);

    res.status(200).json(new ApiResponse(200, null, "Notification marked as read"));
});

// GET /api/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.userId);

    res.status(200).json(new ApiResponse(200, { count }, "Unread count fetched"));
});
