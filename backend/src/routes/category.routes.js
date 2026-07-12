import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    addCategoryFieldController,
    createCategoryController,
    listCategoriesController,
    listCategoryFieldsController,
    updateCategoryController,
} from "../controllers/category.controller.js";
import {
    validateAddCategoryField,
    validateCategoryFieldListQuery,
    validateCategoryListQuery,
    validateCreateCategory,
    validateUpdateCategory,
} from "../validators/category.validator.js";

const router = Router();

router.use(authenticate, requireRole("Admin"));

router
    .route("/")
    .get(validate(validateCategoryListQuery, "query"), listCategoriesController)
    .post(validate(validateCreateCategory), createCategoryController);

router.route("/:id").put(validate(validateUpdateCategory), updateCategoryController);
router
    .route("/:id/fields")
    .get(validate(validateCategoryFieldListQuery, "query"), listCategoryFieldsController)
    .post(validate(validateAddCategoryField), addCategoryFieldController);

export default router;

