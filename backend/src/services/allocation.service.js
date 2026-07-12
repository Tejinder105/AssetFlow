import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

// ────────────────────────────────────────────────────────────────
// ALLOCATE ASSET
// ────────────────────────────────────────────────────────────────
/**
 * Allocate an asset to a user or department.
 * BUSINESS RULE: Blocks if the asset already has an Active allocation.
 * Returns 409 with current holder info so the caller can initiate a transfer.
 */
export const allocate = async ({
    assetId,
    allocatedToUserId,
    allocatedToDepartmentId,
    allocatedBy,
    expectedReturnDate,
}) => {
    // Guard: check for existing active allocation on this asset
    const active = await prisma.allocation.findFirst({
        where: { assetId, status: "Active" },
        include: {
            allocatedToUser: { select: { userId: true, name: true, email: true } },
            allocatedToDepartment: { select: { departmentId: true, name: true } },
        },
    });

    if (active) {
        throw new ApiError(409, "Asset is already allocated", [
            {
                currentHolder: active.allocatedToUser || active.allocatedToDepartment,
                allocationId: active.allocationId,
                suggestion: "Create a transfer request instead",
            },
        ]);
    }

    // Verify the asset exists and is Available
    const asset = await prisma.asset.findUnique({ where: { assetId } });
    if (!asset) throw new ApiError(404, "Asset not found");
    if (asset.status !== "Available") {
        throw new ApiError(400, `Asset cannot be allocated — current status: ${asset.status}`);
    }

    // Create allocation + update asset in a transaction
    const [allocation] = await prisma.$transaction([
        prisma.allocation.create({
            data: {
                assetId,
                allocatedToUserId: allocatedToUserId || null,
                allocatedToDepartmentId: allocatedToDepartmentId || null,
                allocatedBy,
                expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
            },
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true } },
                allocatedToUser: { select: { userId: true, name: true } },
                allocatedToDepartment: { select: { departmentId: true, name: true } },
            },
        }),
        prisma.asset.update({
            where: { assetId },
            data: {
                status: "Allocated",
                currentHolderUserId: allocatedToUserId || null,
                currentHolderDepartmentId: allocatedToDepartmentId || null,
            },
        }),
        // Log the status change
        prisma.assetStatusLog.create({
            data: {
                assetId,
                fromStatus: asset.status,
                toStatus: "Allocated",
                changedBy: allocatedBy,
                reason: `Allocated to ${allocatedToUserId ? `user ${allocatedToUserId}` : `department ${allocatedToDepartmentId}`}`,
            },
        }),
    ]);

    return allocation;
};

// ────────────────────────────────────────────────────────────────
// RETURN ASSET
// ────────────────────────────────────────────────────────────────
/**
 * Return an allocated asset. Reverts asset status to Available.
 */
export const returnAsset = async (allocationId, { returnConditionNotes, returnedBy }) => {
    const allocation = await prisma.allocation.findUnique({
        where: { allocationId },
    });

    if (!allocation) throw new ApiError(404, "Allocation not found");
    if (allocation.status !== "Active") {
        throw new ApiError(400, "Only active allocations can be returned");
    }

    const [updatedAllocation] = await prisma.$transaction([
        prisma.allocation.update({
            where: { allocationId },
            data: {
                status: "Returned",
                actualReturnDate: new Date(),
                returnConditionNotes: returnConditionNotes || null,
            },
        }),
        prisma.asset.update({
            where: { assetId: allocation.assetId },
            data: {
                status: "Available",
                currentHolderUserId: null,
                currentHolderDepartmentId: null,
            },
        }),
        prisma.assetStatusLog.create({
            data: {
                assetId: allocation.assetId,
                fromStatus: "Allocated",
                toStatus: "Available",
                changedBy: returnedBy,
                reason: "Asset returned",
            },
        }),
    ]);

    return updatedAllocation;
};

// ────────────────────────────────────────────────────────────────
// LIST ALLOCATIONS
// ────────────────────────────────────────────────────────────────
export const listAllocations = async (filters, { skip, take }) => {
    const where = {};
    if (filters.assetId) where.assetId = parseInt(filters.assetId, 10);
    if (filters.userId) where.allocatedToUserId = parseInt(filters.userId, 10);
    if (filters.departmentId) where.allocatedToDepartmentId = parseInt(filters.departmentId, 10);
    if (filters.status) where.status = filters.status;

    const [allocations, total] = await Promise.all([
        prisma.allocation.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true, status: true } },
                allocatedToUser: { select: { userId: true, name: true, email: true } },
                allocatedToDepartment: { select: { departmentId: true, name: true } },
                allocator: { select: { userId: true, name: true } },
            },
        }),
        prisma.allocation.count({ where }),
    ]);

    return { allocations, total };
};

// ────────────────────────────────────────────────────────────────
// GET OVERDUE ALLOCATIONS
// ────────────────────────────────────────────────────────────────
export const getOverdue = async ({ skip, take }) => {
    const where = {
        status: "Active",
        expectedReturnDate: { lt: new Date() },
    };

    const [allocations, total] = await Promise.all([
        prisma.allocation.findMany({
            where,
            skip,
            take,
            orderBy: { expectedReturnDate: "asc" },
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true } },
                allocatedToUser: { select: { userId: true, name: true, email: true } },
                allocatedToDepartment: { select: { departmentId: true, name: true } },
            },
        }),
        prisma.allocation.count({ where }),
    ]);

    return { allocations, total };
};
