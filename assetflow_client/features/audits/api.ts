import { authenticatedApiRequest } from "@/lib/api"
import {
  auditCycleResponseSchema,
  auditItemsResponseSchema,
  auditItemUpdateResponseSchema,
  discrepanciesResponseSchema,
  closeCycleResponseSchema,
  type AuditCycle,
  type AuditItem,
} from "@/features/audits/schema"
import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"

// ── Fetch audit cycle details ─────────────────────────────────────
// GET /api/v1/audits/:id

const auditCycleByIdSchema = apiEnvelopeSchema(
  z.object({
    cycle: z.object({
      auditCycleId: z.number(),
      name: z.string(),
      status: z.enum(["Planned", "Ongoing", "Closed"]),
      startDate: z.string(),
      endDate: z.string(),
      scopeDepartmentId: z.number().nullable(),
      scopeLocation: z.string().nullable(),
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
        .nullable(),
      auditors: z.array(
        z.object({
          auditorUserId: z.number(),
          auditor: z.object({
            userId: z.number(),
            name: z.string(),
            email: z.string(),
          }),
        })
      ),
      _count: z
        .object({
          items: z.number(),
          auditors: z.number(),
        })
        .nullable(),
    }),
  })
)

export async function fetchAuditCycle(cycleId: number): Promise<AuditCycle> {
  const response = await authenticatedApiRequest({
    path: `/api/v1/audits/${cycleId}`,
    responseSchema: auditCycleByIdSchema,
  })
  return response.data.cycle as AuditCycle
}

// ── Fetch audit items for a cycle ────────────────────────────────────
// GET /api/v1/audits/:id/items

export async function fetchAuditItems(cycleId: number, page = 1, limit = 100) {
  return authenticatedApiRequest({
    path: `/api/v1/audits/${cycleId}/items`,
    query: { page, limit },
    responseSchema: auditItemsResponseSchema,
  })
}

// ── Mark an audit item ────────────────────────────────────────────────
// PATCH /api/v1/audits/:id/items/:itemId

const markItemBodySchema = z.object({
  verificationStatus: z.enum(["Verified", "Missing", "Damaged"]),
  notes: z.string().optional(),
})

export async function markAuditItem(
  cycleId: number,
  itemId: number,
  status: "Verified" | "Missing" | "Damaged",
  notes?: string
): Promise<AuditItem> {
  const response = await authenticatedApiRequest({
    path: `/api/v1/audits/${cycleId}/items/${itemId}`,
    method: "PATCH",
    body: { verificationStatus: status, notes },
    bodySchema: markItemBodySchema,
    responseSchema: auditItemUpdateResponseSchema,
  })
  return response.data.item as AuditItem
}

// ── Fetch discrepancies for a cycle ────────────────────────────────────
// GET /api/v1/audits/:id/discrepancies

export async function fetchDiscrepancies(cycleId: number) {
  return authenticatedApiRequest({
    path: `/api/v1/audits/${cycleId}/discrepancies`,
    responseSchema: discrepanciesResponseSchema,
  })
}

// ── Close an audit cycle ─────────────────────────────────────────────
// PATCH /api/v1/audits/:id/close

export async function closeAuditCycle(cycleId: number): Promise<AuditCycle> {
  const response = await authenticatedApiRequest({
    path: `/api/v1/audits/${cycleId}/close`,
    method: "PATCH",
    responseSchema: closeCycleResponseSchema,
  })
  return response.data.cycle as AuditCycle
}
