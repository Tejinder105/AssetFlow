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
            departmentId: true,
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
const canManageAssets = (user) => ["Admin", "AssetManager"].includes(user.role);

const assetScope = (user) => {
    if (canManageAssets(user)) return null;
    if (user.role === "Employee") return { currentHolderUserId: user.userId };
    if (user.role === "DepartmentHead") {
        if (!user.departmentId) return { assetId: -1 };
        return {
            OR: [
                { currentHolderDepartmentId: user.departmentId },
                { holderUser: { departmentId: user.departmentId } },
            ],
        };
    }
    return { assetId: -1 };
};

export const listAssets = async (filters, { skip, take }, user) => {
    const conditions = [];

    if (filters.status) conditions.push({ status: filters.status });
    if (filters.categoryId) conditions.push({ categoryId: parseInt(filters.categoryId, 10) });
    if (filters.location) conditions.push({ location: { contains: filters.location } });
    if (filters.search) {
        conditions.push({ OR: [
            { name: { contains: filters.search } },
            { assetTag: { contains: filters.search } },
            { serialNumber: { contains: filters.search } },
        ] });
    }
    conditions.push(assetScope(user));
    const where = { AND: conditions.filter(Boolean) };

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
export const getAssetById = async (assetId, user) => {
    const asset = await prisma.asset.findUnique({
        where: { assetId },
        select: {
            ...assetSelect,
            creator: { select: { userId: true, name: true } },
        },
    });

    if (!asset) throw new ApiError(404, "Asset not found");

    const scope = assetScope(user);
    const isAllowed = !scope ||
        (user.role === "Employee" && asset.holderUser?.userId === user.userId) ||
        (user.role === "DepartmentHead" && (
            asset.holderDepartment?.departmentId === user.departmentId ||
            asset.holderUser?.departmentId === user.departmentId
        ));
    if (!isAllowed) throw new ApiError(403, "You do not have access to this asset");
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
