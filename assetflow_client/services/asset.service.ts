import { z } from "zod"

import { authenticatedApiRequest } from "@/lib/api"
import type { Allocation, Asset, AssetCategory, EmployeeOption, Transfer } from "@/types/asset"

const envelope = <T extends z.ZodType>(data: T) =>
  z.object({ success: z.boolean(), message: z.string(), data })

const nullable = <T extends z.ZodType>(schema: T) => schema.nullable()

const employeeSchema = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string().email(),
  departmentId: z.number().nullable(),
  department: nullable(z.object({ departmentId: z.number(), name: z.string() })),
})

const assetSchema = z.object({
  assetId: z.number(),
  assetTag: z.string(),
  name: z.string(),
  serialNumber: z.string().nullable(),
  status: z.string(),
  condition: z.string().nullable(),
  location: z.string().nullable(),
  isBookable: z.boolean(),
  category: z.object({ categoryId: z.number(), name: z.string() }),
  holderUser: nullable(z.object({ userId: z.number(), name: z.string() })),
  holderDepartment: nullable(z.object({ departmentId: z.number(), name: z.string() })),
})

const paginationSchema = z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() })
const paginated = <T extends z.ZodType>(item: T) => z.object({ data: z.array(item), pagination: paginationSchema })

const allocationSchema = z.object({
  allocationId: z.number(), allocationDate: z.string(), expectedReturnDate: z.string().nullable(),
  actualReturnDate: z.string().nullable(), returnConditionNotes: z.string().nullable(), status: z.string(),
  asset: assetSchema.pick({ assetId: true, assetTag: true, name: true, status: true }),
  allocatedToUser: nullable(employeeSchema),
  allocatedToDepartment: nullable(z.object({ departmentId: z.number(), name: z.string() })),
  allocator: z.object({ userId: z.number(), name: z.string() }),
})

const transferSchema = z.object({
  transferId: z.number(), status: z.string(), reason: z.string().nullable(), createdAt: z.string(),
  asset: assetSchema.pick({ assetId: true, assetTag: true, name: true }),
  currentHolder: nullable(z.object({ userId: z.number(), name: z.string() })),
  requestedTo: z.object({ userId: z.number(), name: z.string() }),
  requester: z.object({ userId: z.number(), name: z.string() }),
  approver: nullable(z.object({ userId: z.number(), name: z.string() })),
})

export const listAssets = (query: Record<string, string | number | undefined> = {}) =>
  authenticatedApiRequest({ path: "/api/v1/assets", query, responseSchema: envelope(paginated(assetSchema)) })

export const listCategories = () =>
  authenticatedApiRequest({
    path: "/api/v1/categories", query: { limit: 100 },
    responseSchema: envelope(z.object({ items: z.array(z.object({ categoryId: z.number(), name: z.string() })), pagination: paginationSchema })),
  })

export const listEmployees = () =>
  authenticatedApiRequest({
    path: "/api/v1/employees", query: { limit: 100, status: "Active" },
    responseSchema: envelope(z.object({ items: z.array(employeeSchema), pagination: paginationSchema })),
  })

export const createAsset = (payload: {
  name: string; categoryId: number; serialNumber?: string; acquisitionDate?: string; acquisitionCost?: number
  condition?: string; location?: string; isBookable?: boolean
}) => authenticatedApiRequest({
  path: "/api/v1/assets", method: "POST", body: payload,
  responseSchema: envelope(z.object({ asset: assetSchema })),
})

export const listAllocations = () =>
  authenticatedApiRequest({ path: "/api/v1/allocations", query: { limit: 100 }, responseSchema: envelope(paginated(allocationSchema)) })

export const allocateAsset = (payload: { assetId: number; allocatedToUserId: number; expectedReturnDate?: string }) =>
  authenticatedApiRequest({ path: "/api/v1/allocations", method: "POST", body: payload, responseSchema: envelope(z.object({ allocation: z.object({ allocationId: z.number() }) })) })

export const listTransfers = () =>
  authenticatedApiRequest({ path: "/api/v1/transfers", query: { limit: 100 }, responseSchema: envelope(paginated(transferSchema)) })

export const requestTransfer = (payload: { assetId: number; requestedToUserId: number; reason?: string }) =>
  authenticatedApiRequest({ path: "/api/v1/transfers", method: "POST", body: payload, responseSchema: envelope(z.object({ transfer: z.object({ transferId: z.number() }) })) })

export const decideTransfer = (transferId: number, approve: boolean) =>
  authenticatedApiRequest({
    path: `/api/v1/transfers/${transferId}/${approve ? "approve" : "reject"}`,
    method: "PATCH", body: {}, responseSchema: envelope(z.object({ transfer: z.object({ transferId: z.number() }) })),
  })

export type { Allocation, Asset, AssetCategory, EmployeeOption, Transfer }
