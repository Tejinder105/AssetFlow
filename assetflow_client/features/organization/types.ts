import { z } from "zod"
import {
  organizationCategorySchema,
  organizationDepartmentSchema,
  organizationEmployeeSchema,
} from "@/features/organization/schema"

export type OrganizationDepartment = z.infer<typeof organizationDepartmentSchema>
export type OrganizationCategory = z.infer<typeof organizationCategorySchema>
export type OrganizationEmployee = z.infer<typeof organizationEmployeeSchema>
