import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

// ────────────────────────────────────────────────────────────────
// REQUEST TRANSFER
// ────────────────────────────────────────────────────────────────
/**
 * Create a transfer request. Fills currentHolderUserId from the asset.
 */
export const requestTransfer = async ({ assetId, requestedToUserId, reason, requestedBy }) => {
    const asset = await prisma.asset.findUnique({ where: { assetId } });
    if (!asset) throw new ApiError(404, "Asset not found");

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({ where: { userId: requestedToUserId } });
    if (!targetUser) throw new ApiError(404, "Target user not found");

    const transfer = await prisma.transferRequest.create({
        data: {
            assetId,
            currentHolderUserId: asset.currentHolderUserId,
            requestedToUserId,
            requestedBy,
            reason: reason || null,
        },
        include: {
            asset: { select: { assetId: true, assetTag: true, name: true } },
            currentHolder: { select: { userId: true, name: true } },
            requestedTo: { select: { userId: true, name: true } },
            requester: { select: { userId: true, name: true } },
        },
    });

    return transfer;
};

// ────────────────────────────────────────────────────────────────
// APPROVE TRANSFER
// ────────────────────────────────────────────────────────────────
/**
 * Approve a transfer: end current allocation, create new one,
 * update asset holder, set transfer status to Approved.
 * All in a single transaction.
 */
export const approveTransfer = async (transferId, approvedBy) => {
    const transfer = await prisma.transferRequest.findUnique({
        where: { transferId },
    });

    if (!transfer) throw new ApiError(404, "Transfer request not found");
    if (transfer.status !== "Requested") {
        throw new ApiError(400, `Transfer cannot be approved — current status: ${transfer.status}`);
    }

    const operations = [];

    // 1. End the current active allocation (if any)
    const activeAllocation = await prisma.allocation.findFirst({
        where: { assetId: transfer.assetId, status: "Active" },
    });

    if (activeAllocation) {
        operations.push(
            prisma.allocation.update({
                where: { allocationId: activeAllocation.allocationId },
                data: { status: "Returned", actualReturnDate: new Date() },
            })
        );
    }

    // 2. Create new allocation for the target user
    operations.push(
        prisma.allocation.create({
            data: {
                assetId: transfer.assetId,
                allocatedToUserId: transfer.requestedToUserId,
                allocatedBy: approvedBy,
            },
        })
    );

    // 3. Update asset holder
    operations.push(
        prisma.asset.update({
            where: { assetId: transfer.assetId },
            data: {
                currentHolderUserId: transfer.requestedToUserId,
                currentHolderDepartmentId: null,
                status: "Allocated",
            },
        })
    );

    // 4. Update transfer status
    operations.push(
        prisma.transferRequest.update({
            where: { transferId },
            data: {
                status: "Approved",
                approvedBy,
                approvedAt: new Date(),
            },
        })
    );

    // 5. Log status change
    operations.push(
        prisma.assetStatusLog.create({
            data: {
                assetId: transfer.assetId,
                fromStatus: "Allocated",
                toStatus: "Allocated",
                changedBy: approvedBy,
                reason: `Transfer approved — reassigned to user ${transfer.requestedToUserId}`,
            },
        })
    );

    await prisma.$transaction(operations);

    return prisma.transferRequest.findUnique({
        where: { transferId },
        include: {
            asset: { select: { assetId: true, assetTag: true, name: true } },
            requestedTo: { select: { userId: true, name: true } },
            approver: { select: { userId: true, name: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// REJECT TRANSFER
// ────────────────────────────────────────────────────────────────
export const rejectTransfer = async (transferId, approvedBy, reason) => {
    const transfer = await prisma.transferRequest.findUnique({
        where: { transferId },
    });

    if (!transfer) throw new ApiError(404, "Transfer request not found");
    if (transfer.status !== "Requested") {
        throw new ApiError(400, `Transfer cannot be rejected — current status: ${transfer.status}`);
    }

    return prisma.transferRequest.update({
        where: { transferId },
        data: {
            status: "Rejected",
            approvedBy,
            approvedAt: new Date(),
            reason: reason || transfer.reason,
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LIST TRANSFERS
// ────────────────────────────────────────────────────────────────
export const listTransfers = async (filters, { skip, take }) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.assetId) where.assetId = parseInt(filters.assetId, 10);
    if (filters.userId) {
        where.OR = [
            { requestedBy: parseInt(filters.userId, 10) },
            { requestedToUserId: parseInt(filters.userId, 10) },
            { currentHolderUserId: parseInt(filters.userId, 10) },
        ];
    }

    const [transfers, total] = await Promise.all([
        prisma.transferRequest.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true } },
                currentHolder: { select: { userId: true, name: true } },
                requestedTo: { select: { userId: true, name: true } },
                requester: { select: { userId: true, name: true } },
                approver: { select: { userId: true, name: true } },
            },
        }),
        prisma.transferRequest.count({ where }),
    ]);

    return { transfers, total };
};
