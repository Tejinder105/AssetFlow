import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"

// ── Enums ──────────────────────────────────────────────────────

export const bookingStatusSchema = z.enum([
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
])

// ── Embedded summaries (matches backend `include` selects) ─────

export const assetSummarySchema = z.object({
  assetId: z.number(),
  assetTag: z.string(),
  name: z.string(),
})

export const userSummarySchema = z.object({
  userId: z.number(),
  name: z.string(),
})

export const departmentSummarySchema = z
  .object({
    departmentId: z.number(),
    name: z.string(),
  })
  .nullable()

// ── Booking object ─────────────────────────────────────────────

export const bookingSchema = z.object({
  bookingId: z.number(),
  assetId: z.number(),
  bookedByUserId: z.number(),
  departmentId: z.number().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  status: bookingStatusSchema,
  cancelledReason: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  asset: assetSummarySchema.optional(),
  bookedBy: userSummarySchema.optional(),
  department: departmentSummarySchema.optional(),
})

// ── Request body schemas ───────────────────────────────────────

export const createBookingSchema = z.object({
  assetId: z.number().int().positive("Asset is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  departmentId: z.number().int().positive().optional(),
})

export const rescheduleBookingSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
})

export const cancelBookingSchema = z.object({
  cancelledReason: z.string().max(255).optional(),
})

// ── Response schemas ───────────────────────────────────────────

/** Single booking response — POST create / PATCH cancel / PATCH reschedule */
export const bookingResponseSchema = apiEnvelopeSchema(
  z.object({ booking: bookingSchema })
)

/** Paginated bookings list — GET /api/v1/bookings */
export const bookingsListResponseSchema = apiEnvelopeSchema(
  z.object({
    data: z.array(bookingSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  })
)

/** Calendar view — GET /api/v1/bookings/calendar */
export const calendarResponseSchema = apiEnvelopeSchema(
  z.object({ bookings: z.array(bookingSchema) })
)
