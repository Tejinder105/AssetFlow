import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createDepartmentController,
    listDepartmentsController,
    patchDepartmentStatusController,
    updateDepartmentController,
} from "../controllers/department.controller.js";
import {
    validateCreateDepartment,
    validateDepartmentListQuery,
    validateDepartmentStatusPatch,
    validateUpdateDepartment,
} from "../validators/department.validator.js";

const router = Router();

router.use(authenticate, requireRole("Admin"));

router
    .route("/")
    .get(validate(validateDepartmentListQuery, "query"), listDepartmentsController)
    .post(validate(validateCreateDepartment), createDepartmentController);

router.route("/:id").put(validate(validateUpdateDepartment), updateDepartmentController);
router
    .route("/:id/status")
    .patch(validate(validateDepartmentStatusPatch), patchDepartmentStatusController);

export default router;

