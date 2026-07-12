import { prisma } from "../db/index.js";

// ────────────────────────────────────────────────────────────────
// UTILIZATION BY DEPARTMENT
// ────────────────────────────────────────────────────────────────
export const utilizationByDepartment = async () => {
    const departments = await prisma.department.findMany({
        where: { status: "Active" },
        select: {
            departmentId: true,
            name: true,
            _count: {
                select: {
                    assetsHeld: true,
                    allocations: true,
                    bookings: true,
                },
            },
        },
    });

    // Also get asset status breakdown per department
    const statusBreakdown = await prisma.asset.groupBy({
        by: ["currentHolderDepartmentId", "status"],
        _count: { assetId: true },
        where: { currentHolderDepartmentId: { not: null } },
    });

    return { departments, statusBreakdown };
};

// ────────────────────────────────────────────────────────────────
// MAINTENANCE FREQUENCY
// ────────────────────────────────────────────────────────────────
export const maintenanceFrequency = async () => {
    const results = await prisma.maintenanceRequest.groupBy({
        by: ["assetId"],
        _count: { requestId: true },
        orderBy: { _count: { requestId: "desc" } },
        take: 20,
    });

    // Enrich with asset details
    const assetIds = results.map((r) => r.assetId);
    const assets = await prisma.asset.findMany({
        where: { assetId: { in: assetIds } },
        select: { assetId: true, assetTag: true, name: true, status: true },
    });

    const assetMap = Object.fromEntries(assets.map((a) => [a.assetId, a]));

    return results.map((r) => ({
        asset: assetMap[r.assetId] || null,
        requestCount: r._count.requestId,
    }));
};

// ────────────────────────────────────────────────────────────────
// MOST USED / IDLE ASSETS
// ────────────────────────────────────────────────────────────────
export const mostUsedIdleAssets = async () => {
    // Most used: assets with the most allocations
    const mostUsed = await prisma.allocation.groupBy({
        by: ["assetId"],
        _count: { allocationId: true },
        orderBy: { _count: { allocationId: "desc" } },
        take: 10,
    });

    const usedAssetIds = mostUsed.map((r) => r.assetId);
    const usedAssets = await prisma.asset.findMany({
        where: { assetId: { in: usedAssetIds } },
        select: { assetId: true, assetTag: true, name: true, status: true },
    });
    const usedMap = Object.fromEntries(usedAssets.map((a) => [a.assetId, a]));

    // Idle: assets that are Available and have no allocations in the last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentlyAllocatedIds = await prisma.allocation.findMany({
        where: { createdAt: { gt: ninetyDaysAgo } },
        select: { assetId: true },
        distinct: ["assetId"],
    });
    const recentIds = recentlyAllocatedIds.map((r) => r.assetId);

    const idleAssets = await prisma.asset.findMany({
        where: {
            status: "Available",
            assetId: { notIn: recentIds.length > 0 ? recentIds : [0] },
        },
        select: { assetId: true, assetTag: true, name: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: "asc" },
    });

    return {
        mostUsed: mostUsed.map((r) => ({
            asset: usedMap[r.assetId] || null,
            allocationCount: r._count.allocationId,
        })),
        idle: idleAssets,
    };
};

// ────────────────────────────────────────────────────────────────
// BOOKING HEATMAP
// ────────────────────────────────────────────────────────────────
export const bookingHeatmap = async () => {
    const bookings = await prisma.booking.findMany({
        where: { status: { not: "Cancelled" } },
        select: { startTime: true },
    });

    // Group by day-of-week and hour
    const heatmap = {};
    for (const b of bookings) {
        const date = new Date(b.startTime);
        const day = date.getDay(); // 0=Sun, 6=Sat
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        heatmap[key] = (heatmap[key] || 0) + 1;
    }

    return heatmap;
};
