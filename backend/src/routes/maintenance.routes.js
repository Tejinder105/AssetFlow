import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    validateRaiseRequest,
    validateAssignTechnician,
    validateResolve,
} from "../validators/maintenance.validator.js";
import {
    raiseRequest,
    approveRequest,
    rejectRequest,
    assignTechnician,
    updateProgress,
    resolveRequest,
    listByStatus,
} from "../controllers/maintenance.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(listByStatus)
    .post(validate(validateRaiseRequest), raiseRequest);

router.patch("/:id/approve", requireRole("Admin", "Asset Manager"), approveRequest);
router.patch("/:id/reject", requireRole("Admin", "Asset Manager"), rejectRequest);
router.patch("/:id/assign", requireRole("Admin", "Asset Manager"), validate(validateAssignTechnician), assignTechnician);
router.patch("/:id/progress", requireRole("Admin", "Asset Manager"), updateProgress);
router.patch("/:id/resolve", requireRole("Admin", "Asset Manager"), validate(validateResolve), resolveRequest);

export default router;
