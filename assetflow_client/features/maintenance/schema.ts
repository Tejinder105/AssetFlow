import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"

// ── Enums ──────────────────────────────────────────────────────

export const maintenancePrioritySchema = z.enum([
  "Low",
  "Medium",
  "High",
  "Critical",
])

export const maintenanceStatusSchema = z.enum([
  "Pending",
  "Approved",
  "Rejected",
  "TechnicianAssigned",
  "InProgress",
  "Resolved",
])

// ── Embedded summaries (matches backend `include` selects) ─────

export const assetSummarySchema = z.object({
  assetId: z.number(),
  assetTag: z.string(),
  name: z.string(),
  status: z.string().optional(),
})

export const userSummarySchema = z.object({
  userId: z.number(),
  name: z.string(),
})

// ── MaintenanceRequest object ──────────────────────────────────

export const maintenanceRequestSchema = z.object({
  requestId: z.number(),
  assetId: z.number(),
  raisedBy: z.number(),
  issueDescription: z.string(),
  priority: maintenancePrioritySchema,
  photoUrl: z.string().nullable().optional(),
  status: maintenanceStatusSchema,
  approvedBy: z.number().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  technicianName: z.string().nullable().optional(),
  resolvedAt: z.string().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  asset: assetSummarySchema.optional(),
  raiser: userSummarySchema.optional(),
  approver: userSummarySchema.nullable().optional(),
})

// ── Request body schemas ───────────────────────────────────────

export const raiseRequestSchema = z.object({
  assetId: z.number().int().positive("Asset is required"),
  issueDescription: z
    .string()
    .min(1, "Issue description is required")
    .max(5000),
  priority: maintenancePrioritySchema.optional(),
  photoUrl: z.string().url().optional(),
})

export const assignTechnicianSchema = z.object({
  technicianName: z
    .string()
    .min(1, "Technician name is required")
    .max(150),
})

export const resolveRequestSchema = z.object({
  resolutionNotes: z.string().max(5000).optional(),
})

// ── Response schemas ───────────────────────────────────────────

/** Single maintenance request response */
export const maintenanceResponseSchema = apiEnvelopeSchema(
  z.object({ request: maintenanceRequestSchema })
)

/** Paginated maintenance list — GET /api/v1/maintenance */
export const maintenanceListResponseSchema = apiEnvelopeSchema(
  z.object({
    data: z.array(maintenanceRequestSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  })
)
