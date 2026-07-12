import { z } from "zod"
import {
  bookingSchema,
  bookingStatusSchema,
  createBookingSchema,
  rescheduleBookingSchema,
  cancelBookingSchema,
  assetSummarySchema,
  userSummarySchema,
  departmentSummarySchema,
} from "@/features/bookings/schema"

export type Booking = z.infer<typeof bookingSchema>
export type BookingStatus = z.infer<typeof bookingStatusSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type AssetSummary = z.infer<typeof assetSummarySchema>
export type UserSummary = z.infer<typeof userSummarySchema>
export type DepartmentSummary = z.infer<typeof departmentSummarySchema>
