import { authenticatedApiRequest } from "@/lib/api"
import {
  bookingResponseSchema,
  bookingsListResponseSchema,
  calendarResponseSchema,
  createBookingSchema,
  rescheduleBookingSchema,
  cancelBookingSchema,
} from "@/features/bookings/schema"
import type {
  CreateBookingInput,
  RescheduleBookingInput,
  CancelBookingInput,
} from "@/features/bookings/types"

// ── Create a booking ───────────────────────────────────────────

export const createBooking = (payload: CreateBookingInput) =>
  authenticatedApiRequest({
    path: "/api/v1/bookings",
    method: "POST",
    body: payload,
    bodySchema: createBookingSchema,
    responseSchema: bookingResponseSchema,
  })

// ── List bookings (paginated) ──────────────────────────────────

export const listBookings = (
  filters: {
    assetId?: number
    userId?: number
    status?: string
    page?: number
    limit?: number
  } = {}
) =>
  authenticatedApiRequest({
    path: "/api/v1/bookings",
    query: {
      assetId: filters.assetId,
      userId: filters.userId,
      status: filters.status,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
    responseSchema: bookingsListResponseSchema,
  })

// ── Calendar view ──────────────────────────────────────────────

export const getCalendar = (params: {
  assetId: number
  startDate?: string
  endDate?: string
}) =>
  authenticatedApiRequest({
    path: "/api/v1/bookings/calendar",
    query: {
      assetId: params.assetId,
      startDate: params.startDate,
      endDate: params.endDate,
    },
    responseSchema: calendarResponseSchema,
  })

// ── Cancel a booking ───────────────────────────────────────────

export const cancelBooking = (
  bookingId: number,
  payload: CancelBookingInput = {}
) =>
  authenticatedApiRequest({
    path: `/api/v1/bookings/${bookingId}/cancel`,
    method: "PATCH",
    body: payload,
    bodySchema: cancelBookingSchema,
    responseSchema: bookingResponseSchema,
  })

// ── Reschedule a booking ───────────────────────────────────────

export const rescheduleBooking = (
  bookingId: number,
  payload: RescheduleBookingInput
) =>
  authenticatedApiRequest({
    path: `/api/v1/bookings/${bookingId}/reschedule`,
    method: "PATCH",
    body: payload,
    bodySchema: rescheduleBookingSchema,
    responseSchema: bookingResponseSchema,
  })
