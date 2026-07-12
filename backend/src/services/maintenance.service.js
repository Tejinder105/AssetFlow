import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

// Valid state transitions for the kanban workflow
const VALID_TRANSITIONS = {
    Pending: ["Approved", "Rejected"],
    Approved: ["TechnicianAssigned"],
    TechnicianAssigned: ["InProgress"],
    InProgress: ["Resolved"],
};

// ────────────────────────────────────────────────────────────────
// RAISE REQUEST
// ────────────────────────────────────────────────────────────────
export const raiseRequest = async ({ assetId, issueDescription, priority, photoUrl, raisedBy }) => {
    const asset = await prisma.asset.findUnique({ where: { assetId } });
    if (!asset) throw new ApiError(404, "Asset not found");

    return prisma.maintenanceRequest.create({
        data: {
            assetId,
            raisedBy,
            issueDescription,
            priority: priority || "Medium",
            photoUrl: photoUrl || null,
        },
        include: {
            asset: { select: { assetId: true, assetTag: true, name: true } },
            raiser: { select: { userId: true, name: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// APPROVE REQUEST
// ────────────────────────────────────────────────────────────────
/**
 * Approve a maintenance request. Sets asset status to UnderMaintenance.
 */
export const approveRequest = async (requestId, approvedBy) => {
    const req = await prisma.maintenanceRequest.findUnique({ where: { requestId } });
    if (!req) throw new ApiError(404, "Maintenance request not found");
    if (req.status !== "Pending") {
        throw new ApiError(400, `Cannot approve — current status: ${req.status}`);
    }

    const [updated] = await prisma.$transaction([
        prisma.maintenanceRequest.update({
            where: { requestId },
            data: { status: "Approved", approvedBy, approvedAt: new Date() },
        }),
        prisma.asset.update({
            where: { assetId: req.assetId },
            data: { status: "UnderMaintenance" },
        }),
        prisma.assetStatusLog.create({
            data: {
                assetId: req.assetId,
                fromStatus: "Available",
                toStatus: "Under Maintenance",
                changedBy: approvedBy,
                reason: `Maintenance approved: ${req.issueDescription.substring(0, 100)}`,
            },
        }),
    ]);

    return updated;
};

// ────────────────────────────────────────────────────────────────
// REJECT REQUEST
// ────────────────────────────────────────────────────────────────
export const rejectRequest = async (requestId, approvedBy) => {
    const req = await prisma.maintenanceRequest.findUnique({ where: { requestId } });
    if (!req) throw new ApiError(404, "Maintenance request not found");
    if (req.status !== "Pending") {
        throw new ApiError(400, `Cannot reject — current status: ${req.status}`);
    }

    return prisma.maintenanceRequest.update({
        where: { requestId },
        data: { status: "Rejected", approvedBy, approvedAt: new Date() },
    });
};

// ────────────────────────────────────────────────────────────────
// ASSIGN TECHNICIAN
// ────────────────────────────────────────────────────────────────
export const assignTechnician = async (requestId, technicianName) => {
    const req = await prisma.maintenanceRequest.findUnique({ where: { requestId } });
    if (!req) throw new ApiError(404, "Maintenance request not found");
    if (req.status !== "Approved") {
        throw new ApiError(400, "Technician can only be assigned to approved requests");
    }

    return prisma.maintenanceRequest.update({
        where: { requestId },
        data: { status: "TechnicianAssigned", technicianName },
    });
};

// ────────────────────────────────────────────────────────────────
// UPDATE PROGRESS
// ────────────────────────────────────────────────────────────────
export const updateProgress = async (requestId) => {
    const req = await prisma.maintenanceRequest.findUnique({ where: { requestId } });
    if (!req) throw new ApiError(404, "Maintenance request not found");
    if (req.status !== "TechnicianAssigned") {
        throw new ApiError(400, "Can only mark In Progress after technician is assigned");
    }

    return prisma.maintenanceRequest.update({
        where: { requestId },
        data: { status: "InProgress" },
    });
};

// ────────────────────────────────────────────────────────────────
// RESOLVE REQUEST
// ────────────────────────────────────────────────────────────────
/**
 * Resolve a maintenance request. Reverts asset to Available.
 */
export const resolveRequest = async (requestId, { resolutionNotes, resolvedBy }) => {
    const req = await prisma.maintenanceRequest.findUnique({ where: { requestId } });
    if (!req) throw new ApiError(404, "Maintenance request not found");
    if (req.status !== "InProgress") {
        throw new ApiError(400, "Can only resolve requests that are In Progress");
    }

    const [updated] = await prisma.$transaction([
        prisma.maintenanceRequest.update({
            where: { requestId },
            data: {
                status: "Resolved",
                resolvedAt: new Date(),
                resolutionNotes: resolutionNotes || null,
            },
        }),
        prisma.asset.update({
            where: { assetId: req.assetId },
            data: { status: "Available" },
        }),
        prisma.assetStatusLog.create({
            data: {
                assetId: req.assetId,
                fromStatus: "Under Maintenance",
                toStatus: "Available",
                changedBy: resolvedBy,
                reason: `Maintenance resolved: ${resolutionNotes || "No notes"}`,
            },
        }),
    ]);

    return updated;
};

// ────────────────────────────────────────────────────────────────
// LIST BY STATUS (powers kanban columns)
// ────────────────────────────────────────────────────────────────
export const listByStatus = async (filters, { skip, take }) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.assetId) where.assetId = parseInt(filters.assetId, 10);
    if (filters.priority) where.priority = filters.priority;

    const [requests, total] = await Promise.all([
        prisma.maintenanceRequest.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true, status: true } },
                raiser: { select: { userId: true, name: true } },
                approver: { select: { userId: true, name: true } },
            },
        }),
        prisma.maintenanceRequest.count({ where }),
    ]);

    return { requests, total };
};
