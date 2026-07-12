import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
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

router.use(authenticate, requireRole("Admin"));

router.route("/").get(validate(validateEmployeeListQuery, "query"), listEmployeesController);
router.route("/:id").put(validate(validateUpdateEmployee), updateEmployeeController);
router.route("/:id/role").patch(validate(validatePromoteRole), promoteRoleController);
router.route("/:id/status").patch(deactivateEmployeeController);

export default router;

