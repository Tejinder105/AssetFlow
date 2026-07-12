import { authenticatedApiRequest } from "@/lib/api"
import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"
import {
  maintenanceResponseSchema,
  maintenanceListResponseSchema,
  raiseRequestSchema,
  assignTechnicianSchema,
  resolveRequestSchema,
  maintenanceRequestSchema,
} from "@/features/maintenance/schema"
import type {
  RaiseRequestInput,
  AssignTechnicianInput,
  ResolveRequestInput,
} from "@/features/maintenance/types"

// ── Raise a maintenance request ────────────────────────────────

export const raiseMaintenanceRequest = (payload: RaiseRequestInput) =>
  authenticatedApiRequest({
    path: "/api/v1/maintenance",
    method: "POST",
    body: payload,
    bodySchema: raiseRequestSchema,
    responseSchema: maintenanceResponseSchema,
  })

// ── List maintenance requests (paginated) ──────────────────────

export const listMaintenanceRequests = (
  filters: {
    status?: string
    assetId?: number
    priority?: string
    page?: number
    limit?: number
  } = {}
) =>
  authenticatedApiRequest({
    path: "/api/v1/maintenance",
    query: {
      status: filters.status,
      assetId: filters.assetId,
      priority: filters.priority,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
    responseSchema: maintenanceListResponseSchema,
  })

// ── Approve a maintenance request ──────────────────────────────

/** Status-only update — the backend sets the approver from the JWT */
const statusOnlyResponseSchema = apiEnvelopeSchema(
  z.object({ request: maintenanceRequestSchema })
)

export const approveMaintenanceRequest = (requestId: number) =>
  authenticatedApiRequest({
    path: `/api/v1/maintenance/${requestId}/approve`,
    method: "PATCH",
    responseSchema: statusOnlyResponseSchema,
  })

// ── Reject a maintenance request ──────────────────────────────

export const rejectMaintenanceRequest = (requestId: number) =>
  authenticatedApiRequest({
    path: `/api/v1/maintenance/${requestId}/reject`,
    method: "PATCH",
    responseSchema: statusOnlyResponseSchema,
  })

// ── Assign a technician ────────────────────────────────────────

export const assignTechnician = (
  requestId: number,
  payload: AssignTechnicianInput
) =>
  authenticatedApiRequest({
    path: `/api/v1/maintenance/${requestId}/assign`,
    method: "PATCH",
    body: payload,
    bodySchema: assignTechnicianSchema,
    responseSchema: statusOnlyResponseSchema,
  })

// ── Mark as In Progress ────────────────────────────────────────

export const updateProgress = (requestId: number) =>
  authenticatedApiRequest({
    path: `/api/v1/maintenance/${requestId}/progress`,
    method: "PATCH",
    responseSchema: statusOnlyResponseSchema,
  })

// ── Resolve a maintenance request ──────────────────────────────

export const resolveMaintenanceRequest = (
  requestId: number,
  payload: ResolveRequestInput = {}
) =>
  authenticatedApiRequest({
    path: `/api/v1/maintenance/${requestId}/resolve`,
    method: "PATCH",
    body: payload,
    bodySchema: resolveRequestSchema,
    responseSchema: statusOnlyResponseSchema,
  })
