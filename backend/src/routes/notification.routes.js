import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    listNotifications,
    markRead,
    getUnreadCount,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

// GET /api/notifications/unread-count — must come before /:id
router.get("/unread-count", getUnreadCount);

router.get("/", listNotifications);
router.patch("/:id/read", markRead);

export default router;
