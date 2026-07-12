import { apiRequest } from "@/lib/api"
import {
  categoriesResponseSchema,
  departmentsResponseSchema,
  employeesResponseSchema,
} from "@/features/organization/schema"

const firstPage = { page: 1, limit: 50 }

export const fetchDepartmentsRequest = (token: string) =>
  apiRequest({
    path: "/api/v1/departments",
    token,
    query: firstPage,
    responseSchema: departmentsResponseSchema,
  })

export const fetchCategoriesRequest = (token: string) =>
  apiRequest({
    path: "/api/v1/categories",
    token,
    query: firstPage,
    responseSchema: categoriesResponseSchema,
  })

export const fetchEmployeesRequest = (token: string) =>
  apiRequest({
    path: "/api/v1/employees",
    token,
    query: firstPage,
    responseSchema: employeesResponseSchema,
  })
