import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { validateRequestTransfer, validateApproveReject } from "../validators/transfer.validator.js";
import {
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    listTransfers,
} from "../controllers/transfer.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(listTransfers)
    .post(requireRole("Admin", "Asset Manager"), validate(validateRequestTransfer), requestTransfer);

router.patch("/:id/approve", requireRole("Admin", "Asset Manager", "Department Head"), validate(validateApproveReject), approveTransfer);
router.patch("/:id/reject", requireRole("Admin", "Asset Manager", "Department Head"), validate(validateApproveReject), rejectTransfer);

export default router;
