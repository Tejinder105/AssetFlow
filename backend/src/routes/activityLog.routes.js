import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { listActivityLogs } from "../controllers/activityLog.controller.js";

const router = Router();

router.use(verifyJWT, requireRole("Admin", "Asset Manager"));

router.get("/", listActivityLogs);

export default router;
