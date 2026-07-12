import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

const assetSelect = {
    assetId: true,
    assetTag: true,
    name: true,
    serialNumber: true,
    status: true,
    condition: true,
    location: true,
    isBookable: true,
    acquisitionDate: true,
    acquisitionCost: true,
    createdAt: true,
    updatedAt: true,
    category: {
        select: {
            categoryId: true,
            name: true,
        },
    },
    holderUser: {
        select: {
            userId: true,
            name: true,
        },
    },
    holderDepartment: {
        select: {
            departmentId: true,
            name: true,
        },
    },
};

// ────────────────────────────────────────────────────────────────
// LIST ASSETS
// ────────────────────────────────────────────────────────────────
export const listAssets = async (filters, { skip, take }) => {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = parseInt(filters.categoryId, 10);
    if (filters.location) where.location = { contains: filters.location };
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { assetTag: { contains: filters.search } },
            { serialNumber: { contains: filters.search } },
        ];
    }

    const [assets, total] = await Promise.all([
        prisma.asset.findMany({
            where,
            select: assetSelect,
            skip,
            take,
            orderBy: { createdAt: "desc" },
        }),
        prisma.asset.count({ where }),
    ]);

    return { assets, total };
};

// ────────────────────────────────────────────────────────────────
// GET ASSET BY ID
// ────────────────────────────────────────────────────────────────
export const getAssetById = async (assetId) => {
    const asset = await prisma.asset.findUnique({
        where: { assetId },
        select: {
            ...assetSelect,
            creator: { select: { userId: true, name: true } },
        },
    });

    if (!asset) throw new ApiError(404, "Asset not found");
    return asset;
};

// ────────────────────────────────────────────────────────────────
// CREATE ASSET
// ────────────────────────────────────────────────────────────────
export const createAsset = async (data) => {
    // Auto-generate asset tag: AF-XXXX
    const lastAsset = await prisma.asset.findFirst({
        orderBy: { assetId: "desc" },
        select: { assetId: true },
    });
    const nextId = (lastAsset?.assetId || 0) + 1;
    const assetTag = `AF-${String(nextId).padStart(4, "0")}`;

    // Verify category exists
    const category = await prisma.assetCategory.findUnique({
        where: { categoryId: data.categoryId },
    });
    if (!category) throw new ApiError(400, "Invalid category");

    const asset = await prisma.asset.create({
        data: {
            assetTag,
            name: data.name,
            categoryId: data.categoryId,
            serialNumber: data.serialNumber || null,
            acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
            acquisitionCost: data.acquisitionCost || null,
            condition: data.condition || "New",
            location: data.location || null,
            isBookable: data.isBookable || false,
            createdBy: data.createdBy,
        },
        select: assetSelect,
    });

    return asset;
};
