import { z } from "zod"
import { apiEnvelopeSchema, paginatedSchema } from "@/features/api/schema"

// ── Audit Cycle ────────────────────────────────────────────────────

export const auditCycleStatusSchema = z.enum(["Planned", "Ongoing", "Closed"])

const auditCycleSchema = z.object({
  auditCycleId: z.number(),
  name: z.string(),
  status: auditCycleStatusSchema,
  startDate: z.string(),
  endDate: z.string(),
  scopeDepartmentId: z.number().nullable(),
  scopeLocation: z.string().nullable(),
  createdAt: z.string(),
  createdBy: z.number(),
  closedBy: z.number().nullable(),
  closedAt: z.string().nullable(),
  scopeDepartment: z
    .object({
      departmentId: z.number(),
      name: z.string(),
    })
    .nullable(),
  creator: z
    .object({
      userId: z.number(),
      name: z.string(),
    })
    .optional(),
  closer: z
    .object({
      userId: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  auditors: z
    .array(
      z.object({
        auditorUserId: z.number(),
        auditor: z.object({
          userId: z.number(),
          name: z.string(),
          email: z.string(),
        }),
      })
    )
    .optional(),
  _count: z
    .object({
      items: z.number(),
      auditors: z.number(),
    })
    .optional(),
})

export type AuditCycle = z.infer<typeof auditCycleSchema>

// ── Audit Item ─────────────────────────────────────────────────────

export const verificationStatusSchema = z.enum(["Pending", "Verified", "Missing", "Damaged"])

const auditItemSchema = z.object({
  auditItemId: z.number(),
  auditCycleId: z.number(),
  assetId: z.number(),
  verificationStatus: verificationStatusSchema,
  verifiedBy: z.number().nullable(),
  verifiedAt: z.string().nullable(),
  notes: z.string().nullable(),
  asset: z.object({
    assetId: z.number(),
    assetTag: z.string(),
    name: z.string(),
    location: z.string(),
    status: z.string(),
  }),
  verifier: z
    .object({
      userId: z.number(),
      name: z.string(),
    })
    .nullable(),
})

export type AuditItem = z.infer<typeof auditItemSchema>

// ── API Responses ─────────────────────────────────────────────────

export const auditCycleResponseSchema = apiEnvelopeSchema(
  z.object({
    cycle: auditCycleSchema,
  })
)

export const auditItemsResponseSchema = apiEnvelopeSchema(
  paginatedSchema(auditItemSchema)
)

export const auditItemUpdateResponseSchema = apiEnvelopeSchema(
  z.object({
    item: auditItemSchema,
  })
)

export const discrepanciesResponseSchema = apiEnvelopeSchema(
  z.object({
    discrepancies: z.array(
      z.object({
        discrepancyId: z.number(),
        auditItemId: z.number(),
        discrepancyType: z.string(),
        description: z.string().nullable(),
        resolved: z.boolean(),
        auditItem: z.object({
          auditItemId: z.number(),
          asset: z.object({
            assetId: z.number(),
            assetTag: z.string(),
            name: z.string(),
            location: z.string(),
          }),
        }),
      })
    ),
  })
)

export const closeCycleResponseSchema = apiEnvelopeSchema(
  z.object({
    cycle: auditCycleSchema,
  })
)
