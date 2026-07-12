import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    deactivateEmployeeController,
    listEmployeesController,
    promoteRoleController,
    updateEmployeeController,
} from "../controllers/employee.controller.js";
import {
    validateEmployeeListQuery,
    validatePromoteRole,
    validateUpdateEmployee,
} from "../validators/employee.validator.js";

const router = Router();

router.use(authenticate);

// The employee directory is required when a user selects a transfer recipient.
// Mutations remain an administrator-only organization setup capability.
router.route("/").get(validate(validateEmployeeListQuery, "query"), listEmployeesController);
router.use(requireRole("Admin"));
router.route("/:id").put(validate(validateUpdateEmployee), updateEmployeeController);
router.route("/:id/role").patch(validate(validatePromoteRole), promoteRoleController);
router.route("/:id/status").patch(deactivateEmployeeController);

export default router;

