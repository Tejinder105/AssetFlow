import { z } from "zod"
import { apiEnvelopeSchema, paginatedSchema } from "@/features/api/schema"

// ── Dashboard summary counts (aggregated client-side) ──────────

export const dashboardStatsSchema = z.object({
  availableAssets: z.number(),
  allocatedAssets: z.number(),
  maintenanceAssets: z.number(),
  activeBookings: z.number(),
  pendingTransfers: z.number(),
  overdueAllocations: z.number(),
})

export type DashboardStats = z.infer<typeof dashboardStatsSchema>

// ── Activity logs ──────────────────────────────────────────────

export const activityLogSchema = z.object({
  logId: z.number(),
  userId: z.number().nullable(),
  action: z.string(),
  entityType: z.string().nullable(),
  entityId: z.number().nullable(),
  details: z.any().nullable(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.string(),
  user: z
    .object({
      userId: z.number(),
      name: z.string(),
      email: z.string(),
    })
    .nullable()
    .optional(),
})

export type ActivityLog = z.infer<typeof activityLogSchema>

export const activityLogsResponseSchema = apiEnvelopeSchema(
  z.object({
    data: z.array(activityLogSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
)
