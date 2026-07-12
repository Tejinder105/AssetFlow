import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

const categorySelect = {
    categoryId: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            fields: true,
            assets: true,
        },
    },
};

const fieldSelect = {
    fieldId: true,
    categoryId: true,
    fieldName: true,
    fieldType: true,
    isRequired: true,
};

const assertCategoryExists = async (categoryId) => {
    const category = await prisma.assetCategory.findUnique({
        where: { categoryId },
        select: { categoryId: true },
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }
};

const assertUniqueCategoryName = async (name, excludingCategoryId) => {
    const existing = await prisma.assetCategory.findFirst({
        where: {
            name,
            ...(excludingCategoryId ? { categoryId: { not: excludingCategoryId } } : {}),
        },
        select: { categoryId: true },
    });

    if (existing) {
        throw new ApiError(409, "Category name already exists");
    }
};

const assertUniqueFieldName = async (categoryId, fieldName) => {
    const existing = await prisma.categoryField.findFirst({
        where: { categoryId, fieldName },
        select: { fieldId: true },
    });

    if (existing) {
        throw new ApiError(409, "Field name already exists for this category");
    }
};

export const listCategories = async (filters) => {
    const { page, limit, search } = filters;

    const where = search
        ? {
              OR: [
                  { name: { contains: search } },
                  { description: { contains: search } },
              ],
          }
        : {};

    const [items, total] = await prisma.$transaction([
        prisma.assetCategory.findMany({
            where,
            select: categorySelect,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.assetCategory.count({ where }),
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
};

export const createCategory = async (payload) => {
    await assertUniqueCategoryName(payload.name);

    const category = await prisma.assetCategory.create({
        data: payload,
        select: categorySelect,
    });

    return category;
};

export const updateCategory = async (categoryId, payload) => {
    await assertCategoryExists(categoryId);

    if (payload.name !== undefined) {
        await assertUniqueCategoryName(payload.name, categoryId);
    }

    const category = await prisma.assetCategory.update({
        where: { categoryId },
        data: payload,
        select: categorySelect,
    });

    return category;
};

export const listCategoryFields = async (categoryId) => {
    await assertCategoryExists(categoryId);

    const fields = await prisma.categoryField.findMany({
        where: { categoryId },
        select: fieldSelect,
        orderBy: { fieldId: "asc" },
    });

    return fields;
};

export const addCategoryField = async (categoryId, payload) => {
    await assertCategoryExists(categoryId);
    await assertUniqueFieldName(categoryId, payload.fieldName);

    const field = await prisma.categoryField.create({
        data: {
            categoryId,
            fieldName: payload.fieldName,
            fieldType: payload.fieldType,
            ...(payload.isRequired !== undefined ? { isRequired: payload.isRequired } : {}),
        },
        select: fieldSelect,
    });

    return field;
};
