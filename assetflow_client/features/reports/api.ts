import { authenticatedApiRequest } from "@/lib/api"
import {
  utilizationResponseSchema,
  maintenanceFrequencyResponseSchema,
  usageResponseSchema,
  bookingHeatmapResponseSchema,
} from "@/features/reports/schema"

export const fetchUtilizationReport = () =>
  authenticatedApiRequest({
    path: "/api/v1/reports/utilization",
    responseSchema: utilizationResponseSchema,
  })

export const fetchMaintenanceFrequency = () =>
  authenticatedApiRequest({
    path: "/api/v1/reports/maintenance-frequency",
    responseSchema: maintenanceFrequencyResponseSchema,
  })

export const fetchAssetUsage = () =>
  authenticatedApiRequest({
    path: "/api/v1/reports/usage",
    responseSchema: usageResponseSchema,
  })

export const fetchBookingHeatmap = () =>
  authenticatedApiRequest({
    path: "/api/v1/reports/booking-heatmap",
    responseSchema: bookingHeatmapResponseSchema,
  })
