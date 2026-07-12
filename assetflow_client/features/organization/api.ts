import { authenticatedApiRequest } from "@/lib/api"
import {
  categoriesResponseSchema,
  departmentsResponseSchema,
  employeesResponseSchema,
} from "@/features/organization/schema"

const firstPage = { page: 1, limit: 50 }

export const fetchDepartmentsRequest = () =>
  authenticatedApiRequest({
    path: "/api/v1/departments",
    query: firstPage,
    responseSchema: departmentsResponseSchema,
  })

export const fetchCategoriesRequest = () =>
  authenticatedApiRequest({
    path: "/api/v1/categories",
    query: firstPage,
    responseSchema: categoriesResponseSchema,
  })

export const fetchEmployeesRequest = () =>
  authenticatedApiRequest({
    path: "/api/v1/employees",
    query: firstPage,
    responseSchema: employeesResponseSchema,
  })
