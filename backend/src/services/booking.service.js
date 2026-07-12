import { prisma } from "../db/index.js";
import { ApiError } from "../utils/apierror.js";

// ────────────────────────────────────────────────────────────────
// OVERLAP CHECK (shared)
// ────────────────────────────────────────────────────────────────
/**
 * Check if a booking overlaps with any existing non-cancelled booking.
 * Throws 409 if conflict found.
 */
const checkOverlap = async (assetId, startTime, endTime, excludeBookingId = null) => {
    const where = {
        assetId,
        status: { not: "Cancelled" },
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
    };

    if (excludeBookingId) {
        where.bookingId = { not: excludeBookingId };
    }

    const conflict = await prisma.booking.findFirst({
        where,
        include: {
            bookedBy: { select: { userId: true, name: true } },
        },
    });

    if (conflict) {
        throw new ApiError(409, "Time slot overlaps an existing booking", [
            {
                conflictingBookingId: conflict.bookingId,
                startTime: conflict.startTime,
                endTime: conflict.endTime,
                bookedBy: conflict.bookedBy,
            },
        ]);
    }
};

// ────────────────────────────────────────────────────────────────
// CREATE BOOKING
// ────────────────────────────────────────────────────────────────
export const createBooking = async ({ assetId, startTime, endTime, departmentId, bookedByUserId }) => {
    // Validate the asset exists and is bookable
    const asset = await prisma.asset.findUnique({ where: { assetId } });
    if (!asset) throw new ApiError(404, "Asset not found");
    if (!asset.isBookable) throw new ApiError(400, "This asset is not bookable");

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
        throw new ApiError(400, "End time must be after start time");
    }

    // Check for overlap
    await checkOverlap(assetId, startTime, endTime);

    return prisma.booking.create({
        data: {
            assetId,
            bookedByUserId,
            departmentId: departmentId || null,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        },
        include: {
            asset: { select: { assetId: true, assetTag: true, name: true } },
            bookedBy: { select: { userId: true, name: true } },
            department: { select: { departmentId: true, name: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// CANCEL BOOKING
// ────────────────────────────────────────────────────────────────
export const cancelBooking = async (bookingId, { cancelledReason, userId }) => {
    const booking = await prisma.booking.findUnique({ where: { bookingId } });
    if (!booking) throw new ApiError(404, "Booking not found");
    if (booking.status === "Cancelled") throw new ApiError(400, "Booking is already cancelled");
    if (booking.status === "Completed") throw new ApiError(400, "Completed bookings cannot be cancelled");

    // Only the booking owner or Admin/AssetManager can cancel
    if (booking.bookedByUserId !== userId) {
        // This will be checked by the controller via role check
    }

    return prisma.booking.update({
        where: { bookingId },
        data: {
            status: "Cancelled",
            cancelledReason: cancelledReason || null,
        },
    });
};

// ────────────────────────────────────────────────────────────────
// RESCHEDULE BOOKING
// ────────────────────────────────────────────────────────────────
export const rescheduleBooking = async (bookingId, { startTime, endTime }) => {
    const booking = await prisma.booking.findUnique({ where: { bookingId } });
    if (!booking) throw new ApiError(404, "Booking not found");
    if (booking.status === "Cancelled" || booking.status === "Completed") {
        throw new ApiError(400, `Cannot reschedule a ${booking.status.toLowerCase()} booking`);
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw new ApiError(400, "End time must be after start time");
    }

    // Re-run overlap check, excluding this booking
    await checkOverlap(booking.assetId, startTime, endTime, bookingId);

    return prisma.booking.update({
        where: { bookingId },
        data: {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: "Upcoming",
        },
    });
};

// ────────────────────────────────────────────────────────────────
// GET CALENDAR
// ────────────────────────────────────────────────────────────────
export const getCalendar = async (assetId, { startDate, endDate }) => {
    const where = {
        assetId: parseInt(assetId, 10),
        status: { not: "Cancelled" },
    };

    if (startDate && endDate) {
        where.startTime = { lt: new Date(endDate) };
        where.endTime = { gt: new Date(startDate) };
    }

    return prisma.booking.findMany({
        where,
        orderBy: { startTime: "asc" },
        include: {
            bookedBy: { select: { userId: true, name: true } },
            department: { select: { departmentId: true, name: true } },
        },
    });
};

// ────────────────────────────────────────────────────────────────
// LIST BOOKINGS
// ────────────────────────────────────────────────────────────────
export const listBookings = async (filters, { skip, take }) => {
    const where = {};
    if (filters.assetId) where.assetId = parseInt(filters.assetId, 10);
    if (filters.userId) where.bookedByUserId = parseInt(filters.userId, 10);
    if (filters.status) where.status = filters.status;

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            skip,
            take,
            orderBy: { startTime: "desc" },
            include: {
                asset: { select: { assetId: true, assetTag: true, name: true } },
                bookedBy: { select: { userId: true, name: true } },
                department: { select: { departmentId: true, name: true } },
            },
        }),
        prisma.booking.count({ where }),
    ]);

    return { bookings, total };
};
