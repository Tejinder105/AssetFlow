import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
    utilizationByDepartment,
    maintenanceFrequency,
    mostUsedIdleAssets,
    bookingHeatmap,
} from "../controllers/report.controller.js";

const router = Router();

router.use(verifyJWT, requireRole("Admin", "Asset Manager"));

router.get("/utilization", utilizationByDepartment);
router.get("/maintenance-frequency", maintenanceFrequency);
router.get("/usage", mostUsedIdleAssets);
router.get("/booking-heatmap", bookingHeatmap);

export default router;
