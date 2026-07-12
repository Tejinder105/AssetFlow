import { Router } from "express";
import { authenticate as verifyJWT } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
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

router.use(verifyJWT, requireRole("Admin"));

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

