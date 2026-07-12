import { z } from "zod"
import { apiEnvelopeSchema, paginatedSchema } from "@/features/api/schema"
import { userRoleSchema, userStatusSchema } from "@/features/auth/schema"

export const departmentStatusSchema = z.enum(["Active", "Inactive"])

export const countSchema = z.record(z.string(), z.number()).optional()

export const organizationDepartmentSchema = z.object({
  departmentId: z.number(),
  name: z.string(),
  parentDepartmentId: z.number().nullable(),
  headUserId: z.number().nullable(),
  status: departmentStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  parent: z
    .object({
      departmentId: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  head: z
    .object({
      userId: z.number(),
      name: z.string(),
      email: z.string().email(),
      role: userRoleSchema,
      status: userStatusSchema,
    })
    .nullable()
    .optional(),
  _count: countSchema,
})

export const organizationCategorySchema = z.object({
  categoryId: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  _count: countSchema,
})

export const organizationEmployeeSchema = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string().email(),
  departmentId: z.number().nullable(),
  role: userRoleSchema,
  status: userStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  department: z
    .object({
      departmentId: z.number(),
      name: z.string(),
      status: departmentStatusSchema,
    })
    .nullable()
    .optional(),
})

export const departmentsResponseSchema = apiEnvelopeSchema(
  paginatedSchema(organizationDepartmentSchema)
)

export const categoriesResponseSchema = apiEnvelopeSchema(
  paginatedSchema(organizationCategorySchema)
)

export const employeesResponseSchema = apiEnvelopeSchema(
  paginatedSchema(organizationEmployeeSchema)
)
