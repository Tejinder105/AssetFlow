import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/apierror.js";
import {
    addCategoryField,
    createCategory,
    listCategories,
    listCategoryFields,
    updateCategory,
} from "../services/category.service.js";

const parseCategoryId = (value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new ApiError(400, "Category id must be a positive integer");
    }
    return id;
};

export const listCategoriesController = asyncHandler(async (req, res) => {
    const result = await listCategories(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Categories fetched successfully"));
});

export const createCategoryController = asyncHandler(async (req, res) => {
    const category = await createCategory(req.body);
    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

export const updateCategoryController = asyncHandler(async (req, res) => {
    const categoryId = parseCategoryId(req.params.id);
    const category = await updateCategory(categoryId, req.body);
    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

export const addCategoryFieldController = asyncHandler(async (req, res) => {
    const categoryId = parseCategoryId(req.params.id);
    const field = await addCategoryField(categoryId, req.body);
    return res.status(201).json(new ApiResponse(201, field, "Category field created successfully"));
});

export const listCategoryFieldsController = asyncHandler(async (req, res) => {
    const categoryId = parseCategoryId(req.params.id);
    const fields = await listCategoryFields(categoryId);
    return res.status(200).json(new ApiResponse(200, fields, "Category fields fetched successfully"));
});
