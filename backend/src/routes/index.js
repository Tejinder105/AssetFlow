import { Router } from "express";

import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import departmentRouter from "./department.routes.js";
import categoryRouter from "./category.routes.js";
import employeeRouter from "./employee.routes.js";
import allocationRouter from "./allocation.routes.js";
import assetRouter from "./asset.routes.js";
import transferRouter from "./transfer.routes.js";
import bookingRouter from "./booking.routes.js";
import maintenanceRouter from "./maintenance.routes.js";
import auditRouter from "./audit.routes.js";
import reportRouter from "./report.routes.js";
import notificationRouter from "./notification.routes.js";
import activityLogRouter from "./activityLog.routes.js";

const router = Router();

// ── Auth (no /v1 prefix) ───────────────────────────────────────
router.use("/auth", authRouter);

// ── Core Resources ─────────────────────────────────────────────
router.use("/v1/users", userRouter);
router.use("/v1/departments", departmentRouter);
router.use("/v1/categories", categoryRouter);
router.use("/v1/employees", employeeRouter);

// ── Asset Operations ───────────────────────────────────────────
router.use("/v1/assets", assetRouter);
router.use("/v1/allocations", allocationRouter);
router.use("/v1/transfers", transferRouter);
router.use("/v1/bookings", bookingRouter);
router.use("/v1/maintenance", maintenanceRouter);
router.use("/v1/audits", auditRouter);

// ── Analytics & Logs ───────────────────────────────────────────
router.use("/v1/reports", reportRouter);
router.use("/v1/notifications", notificationRouter);
router.use("/v1/activity-logs", activityLogRouter);

export default router;
