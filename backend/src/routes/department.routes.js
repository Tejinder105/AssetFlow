import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
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

router.use(verifyJWT, requireRole("Admin"));

router
    .route("/")
    .get(validate(validateDepartmentListQuery, "query"), listDepartmentsController)
    .post(validate(validateCreateDepartment), createDepartmentController);

router.route("/:id").put(validate(validateUpdateDepartment), updateDepartmentController);
router
    .route("/:id/status")
    .patch(validate(validateDepartmentStatusPatch), patchDepartmentStatusController);

export default router;
