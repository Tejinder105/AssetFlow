import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    validateCreateCycle,
    validateAssignAuditors,
    validateMarkItem,
} from "../validators/audit.validator.js";
import {
    createCycle,
    assignAuditors,
    listCycleAssets,
    markItem,
    getDiscrepancies,
    closeCycle,
    listCycles,
} from "../controllers/audit.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(requireRole("Admin", "Asset Manager"), listCycles)
    .post(requireRole("Admin"), validate(validateCreateCycle), createCycle);

router.post("/:id/auditors", requireRole("Admin"), validate(validateAssignAuditors), assignAuditors);
router.get("/:id/items", requireRole("Admin", "Asset Manager"), listCycleAssets);
router.patch("/:id/items/:itemId", requireRole("Admin", "Asset Manager"), validate(validateMarkItem), markItem);
router.get("/:id/discrepancies", requireRole("Admin", "Asset Manager"), getDiscrepancies);
router.patch("/:id/close", requireRole("Admin"), closeCycle);

export default router;
