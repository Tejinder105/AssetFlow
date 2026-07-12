import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

// ────────────────────────────────────────────────────────────────
// CREATE CYCLE
// ────────────────────────────────────────────────────────────────
/**
 * Create an audit cycle and auto-populate AuditItem rows
 * from assets matching the scope (department and/or location).
 */
export const createCycle = async ({ name, scopeDepartmentId, scopeLocation, startDate, endDate, createdBy }) => {
    // Build asset filter based on scope
    const assetWhere = {};
    if (scopeDepartmentId) assetWhere.currentHolderDepartmentId = scopeDepartmentId;
    if (scopeLocation) assetWhere.location = scopeLocation;

    // Find all assets matching the scope
    const assets = await prisma.asset.findMany({
        where: assetWhere,
        select: { assetId: true },
    });

    // Create the cycle + audit items in a transaction
    const cycle = await prisma.auditCycle.create({
        data: {
            name,
            scopeDepartmentId: scopeDepartmentId || null,
            scopeLocation: scopeLocation || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            createdBy,
            items: {
                create: assets.map((a) => ({
                    assetId: a.assetId,
                })),
            },
        },
        include: {
            scopeDepartment: { select: { departmentId: true, name: true } },
            creator: { select: { userId: true, name: true } },
            _count: { select: { items: true, auditors: true } },
        },
    });

    return cycle;
};

// ────────────────────────────────────────────────────────────────
// ASSIGN AUDITORS
// ────────────────────────────────────────────────────────────────
export const assignAuditors = async (auditCycleId, auditorUserIds) => {
    const cycle = await prisma.auditCycle.findUnique({ where: { auditCycleId } });
    if (!cycle) throw new ApiError(404, "Audit cycle not found");
    if (cycle.status === "Closed") throw new ApiError(400, "Cannot assign auditors to a closed cycle");

    // Upsert: delete existing then recreate
    await prisma.$transaction([
        prisma.auditCycleAuditor.deleteMany({ where: { auditCycleId } }),
        ...auditorUserIds.map((userId) =>
            prisma.auditCycleAuditor.create({
                data: { auditCycleId, auditorUserId: userId },
            })
        ),
        // Set cycle status to Ongoing if currently Planned
        ...(cycle.status === "Planned"
            ? [prisma.auditCycle.update({ where: { auditCycleId }, data: { status: "Ongoing" } })]
            : []),
    ]);

    return prisma.auditCycle.findUnique({
        where: { auditCycleId },
        include: {
            auditors: {
                include: { auditor: { select: { userId: true, name: true, email: true } } },
            },
            _count: { select: { items: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LIST CYCLE ASSETS (checklist view)
// ────────────────────────────────────────────────────────────────
export const listCycleAssets = async (auditCycleId, { skip, take }) => {
    const [items, total] = await Promise.all([
        prisma.auditItem.findMany({
            where: { auditCycleId },
            skip,
            take,
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true, location: true, status: true } },
                verifier: { select: { userId: true, name: true } },
            },
        }),
        prisma.auditItem.count({ where: { auditCycleId } }),
    ]);

    return { items, total };
};

// ────────────────────────────────────────────────────────────────
// MARK ITEM (Verified/Missing/Damaged)
// ────────────────────────────────────────────────────────────────
/**
 * Update verification status of an audit item.
 * Auto-creates DiscrepancyReport for Missing/Damaged.
 */
export const markItem = async (auditItemId, { verificationStatus, notes, verifiedBy }) => {
    const item = await prisma.auditItem.findUnique({ where: { auditItemId } });
    if (!item) throw new ApiError(404, "Audit item not found");

    const operations = [
        prisma.auditItem.update({
            where: { auditItemId },
            data: {
                verificationStatus,
                verifiedBy,
                verifiedAt: new Date(),
                notes: notes || null,
            },
        }),
    ];

    // Auto-create discrepancy report for Missing/Damaged
    if (verificationStatus === "Missing" || verificationStatus === "Damaged") {
        operations.push(
            prisma.discrepancyReport.upsert({
                where: {
                    // Use a composite approach — find existing for this item
                    discrepancyId: 0, // will not match, forces create via upsert
                },
                create: {
                    auditItemId,
                    discrepancyType: verificationStatus,
                    description: notes || null,
                },
                update: {
                    discrepancyType: verificationStatus,
                    description: notes || null,
                },
            })
        );
    }

    // Use findFirst + create pattern instead of upsert for discrepancy
    await prisma.$transaction(async (tx) => {
        await tx.auditItem.update({
            where: { auditItemId },
            data: {
                verificationStatus,
                verifiedBy,
                verifiedAt: new Date(),
                notes: notes || null,
            },
        });

        if (verificationStatus === "Missing" || verificationStatus === "Damaged") {
            const existing = await tx.discrepancyReport.findFirst({
                where: { auditItemId },
            });

            if (existing) {
                await tx.discrepancyReport.update({
                    where: { discrepancyId: existing.discrepancyId },
                    data: { discrepancyType: verificationStatus, description: notes || null },
                });
            } else {
                await tx.discrepancyReport.create({
                    data: {
                        auditItemId,
                        discrepancyType: verificationStatus,
                        description: notes || null,
                    },
                });
            }
        }
    });

    return prisma.auditItem.findUnique({
        where: { auditItemId },
        include: {
            asset: { select: { assetId: true, assetTag: true, name: true } },
            discrepancies: true,
        },
    });
};

// ────────────────────────────────────────────────────────────────
// GET DISCREPANCIES
// ────────────────────────────────────────────────────────────────
export const getDiscrepancies = async (auditCycleId) => {
    return prisma.discrepancyReport.findMany({
        where: {
            auditItem: { auditCycleId },
        },
        include: {
            auditItem: {
                include: {
                    asset: { select: { assetId: true, assetTag: true, name: true, location: true } },
                },
            },
            resolver: { select: { userId: true, name: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// CLOSE CYCLE
// ────────────────────────────────────────────────────────────────
/**
 * Close an audit cycle.
 * Sets asset status to Lost for items confirmed as Missing.
 */
export const closeCycle = async (auditCycleId, closedBy) => {
    const cycle = await prisma.auditCycle.findUnique({ where: { auditCycleId } });
    if (!cycle) throw new ApiError(404, "Audit cycle not found");
    if (cycle.status === "Closed") throw new ApiError(400, "Cycle is already closed");

    // Find all items marked as Missing or Damaged
    const items = await prisma.auditItem.findMany({
        where: { auditCycleId },
    });

    const operations = [];

    for (const item of items) {
        if (item.verificationStatus === "Missing") {
            operations.push(
                prisma.asset.update({
                    where: { assetId: item.assetId },
                    data: { status: "Lost" },
                }),
                prisma.assetStatusLog.create({
                    data: {
                        assetId: item.assetId,
                        toStatus: "Lost",
                        changedBy: closedBy,
                        reason: `Confirmed missing during audit cycle: ${cycle.name}`,
                    },
                })
            );
        }
    }

    // Close the cycle
    operations.push(
        prisma.auditCycle.update({
            where: { auditCycleId },
            data: { status: "Closed", closedBy, closedAt: new Date() },
        })
    );

    await prisma.$transaction(operations);

    return prisma.auditCycle.findUnique({
        where: { auditCycleId },
        include: {
            closer: { select: { userId: true, name: true } },
            _count: { select: { items: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LIST CYCLES
// ────────────────────────────────────────────────────────────────
export const listCycles = async (filters, { skip, take }) => {
    const where = {};
    if (filters.status) where.status = filters.status;

    const [cycles, total] = await Promise.all([
        prisma.auditCycle.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            include: {
                scopeDepartment: { select: { departmentId: true, name: true } },
                creator: { select: { userId: true, name: true } },
                _count: { select: { items: true, auditors: true } },
            },
        }),
        prisma.auditCycle.count({ where }),
    ]);

    return { cycles, total };
};
