import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { listActivityLogs } from "../controllers/activityLog.controller.js";

const router = Router();

router.use(verifyJWT, requireRole("Admin", "Asset Manager"));

router.get("/", listActivityLogs);

export default router;
