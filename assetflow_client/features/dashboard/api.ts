import { authenticatedApiRequest } from "@/lib/api"
import { activityLogsResponseSchema } from "@/features/dashboard/schema"
import type { DashboardStats } from "@/features/dashboard/schema"
import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"

// ── Dashboard stats ────────────────────────────────────────────
// The backend doesn't have a single summary endpoint, so we fetch
// lightweight counts from several endpoints in parallel.

const countSchema = apiEnvelopeSchema(
  z.object({
    data: z.array(z.any()),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  })
)

// Organization endpoints return { items, pagination }
const orgCountSchema = apiEnvelopeSchema(
  z.object({
    items: z.array(z.any()),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  })
)

async function countFromEndpoint(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
  schema: z.ZodType = countSchema
): Promise<number> {
  try {
    const result = await authenticatedApiRequest({
      path,
      query: { page: 1, limit: 1, ...(query || {}) },
      responseSchema: schema,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result as any
    return data.data?.pagination?.total ?? 0
  } catch {
    return 0
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Count assets by querying the allocations endpoint with status filters
  // Since there's no standalone asset list endpoint, we get counts from
  // the employee listing (all users page=1&limit=1) and allocations
  const [
    allocatedCount,
    overdueCount,
    pendingTransfers,
    activeBookings,
  ] = await Promise.all([
    countFromEndpoint("/api/v1/allocations", { status: "Active" }),
    countFromEndpoint("/api/v1/allocations/overdue"),
    countFromEndpoint("/api/v1/transfers", { status: "Requested" }),
    countFromEndpoint("/api/v1/bookings", { status: "Upcoming" }),
  ])

  return {
    availableAssets: 0,    // No standalone asset count endpoint
    allocatedAssets: allocatedCount,
    maintenanceAssets: 0,  // Would need a maintenance count
    activeBookings,
    pendingTransfers,
    overdueAllocations: overdueCount,
  }
}

// ── Recent activity ────────────────────────────────────────────

export async function fetchRecentActivity() {
  return authenticatedApiRequest({
    path: "/api/v1/activity-logs",
    query: { page: 1, limit: 5 },
    responseSchema: activityLogsResponseSchema,
  })
}
