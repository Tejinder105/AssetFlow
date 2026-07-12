import { create } from "zustand"
import {
  fetchCategoriesRequest,
  fetchDepartmentsRequest,
  fetchEmployeesRequest,
} from "@/features/organization/api"
import type {
  OrganizationCategory,
  OrganizationDepartment,
  OrganizationEmployee,
} from "@/features/organization/types"

type OrganizationState = {
  departments: OrganizationDepartment[]
  categories: OrganizationCategory[]
  employees: OrganizationEmployee[]
  isLoading: boolean
  error: string | null
  loadOrganization: () => Promise<void>
  clearError: () => void
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  departments: [],
  categories: [],
  employees: [],
  isLoading: false,
  error: null,

  loadOrganization: async () => {
    set({ isLoading: true, error: null })
    try {
      const [departments, categories, employees] = await Promise.all([
        fetchDepartmentsRequest(),
        fetchCategoriesRequest(),
        fetchEmployeesRequest(),
      ])

      set({
        departments: departments.data.items,
        categories: categories.data.items,
        employees: employees.data.items,
        isLoading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load organization data"
      set({ error: message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
