import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import * as bookingService from "../services/booking.service.js";

// POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking({
        ...req.body,
        bookedByUserId: req.user.userId,
    });

    res.status(201).json(new ApiResponse(201, { booking }, "Booking created successfully"));
});

// GET /api/bookings/calendar
export const getCalendar = asyncHandler(async (req, res) => {
    const { assetId, startDate, endDate } = req.query;
    const bookings = await bookingService.getCalendar(assetId, { startDate, endDate });

    res.status(200).json(new ApiResponse(200, { bookings }, "Calendar fetched"));
});

// PATCH /api/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const booking = await bookingService.cancelBooking(bookingId, {
        ...req.body,
        userId: req.user.userId,
    });

    res.status(200).json(new ApiResponse(200, { booking }, "Booking cancelled"));
});

// PATCH /api/bookings/:id/reschedule
export const rescheduleBooking = asyncHandler(async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const booking = await bookingService.rescheduleBooking(bookingId, req.body);

    res.status(200).json(new ApiResponse(200, { booking }, "Booking rescheduled"));
});

// GET /api/bookings
export const listBookings = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const { bookings, total } = await bookingService.listBookings(req.query, pagination);

    res.status(200).json(
        new ApiResponse(200, paginatedResponse(bookings, total, pagination.page, pagination.limit), "Bookings fetched")
    );
});
