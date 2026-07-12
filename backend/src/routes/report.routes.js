import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
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
