import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"

// ── Department Summary ────────────────────────────────────────────

const departmentSummarySchema = z.object({
  departmentId: z.number(),
  name: z.string(),
  _count: z.object({
    assetsHeld: z.number(),
    allocations: z.number(),
    bookings: z.number(),
  }),
})

// ── Status Breakdown ───────────────────────────────────────────────

const statusBreakdownItemSchema = z.object({
  currentHolderDepartmentId: z.number().nullable(),
  status: z.string(),
  _count: z.object({
    assetId: z.number(),
  }),
})

// ── Utilization Response ────────────────────────────────────────────

export const utilizationResponseSchema = apiEnvelopeSchema(
  z.object({
    departments: z.array(departmentSummarySchema),
    statusBreakdown: z.array(statusBreakdownItemSchema),
  })
)

// ── Maintenance Frequency Response ───────────────────────────────

const maintenanceFrequencyItemSchema = z.object({
  asset: z
    .object({
      assetId: z.number(),
      assetTag: z.string(),
      name: z.string(),
      status: z.string(),
    })
    .nullable(),
  requestCount: z.number(),
})

// Backend returns array directly, not wrapped in object
export const maintenanceFrequencyResponseSchema = apiEnvelopeSchema(
  z.array(maintenanceFrequencyItemSchema)
)

// ── Most Used / Idle Assets Response ─────────────────────────────

const mostUsedItemSchema = z.object({
  asset: z
    .object({
      assetId: z.number(),
      assetTag: z.string(),
      name: z.string(),
      status: z.string(),
    })
    .nullable(),
  allocationCount: z.number(),
})

const idleAssetSchema = z.object({
  assetId: z.number(),
  assetTag: z.string(),
  name: z.string(),
  createdAt: z.string(),
})

export const usageResponseSchema = apiEnvelopeSchema(
  z.object({
    mostUsed: z.array(mostUsedItemSchema),
    idle: z.array(idleAssetSchema),
  })
)

// ── Booking Heatmap Response ──────────────────────────────────────

export const bookingHeatmapResponseSchema = apiEnvelopeSchema(
  z.object({
    heatmap: z.record(z.string(), z.number()),
  })
)
