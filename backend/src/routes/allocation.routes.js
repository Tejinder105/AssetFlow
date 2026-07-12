import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateAllocate, validateReturn } from "../validators/allocation.validator.js";
import {
    allocateAsset,
    returnAsset,
    listAllocations,
    getOverdueAllocations,
} from "../controllers/allocation.controller.js";

const router = Router();

router.use(verifyJWT);

// GET /api/allocations/overdue — must come before /:id routes
router.get("/overdue", requireRole("Admin", "Asset Manager"), getOverdueAllocations);

router
    .route("/")
    .get(listAllocations)
    .post(requireRole("Admin", "Asset Manager"), validate(validateAllocate), allocateAsset);

router.post("/:id/return", requireRole("Admin", "Asset Manager"), validate(validateReturn), returnAsset);

export default router;
