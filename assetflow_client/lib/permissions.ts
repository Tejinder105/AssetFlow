import type { UserRole } from "@/features/auth/types"

export const roleLabels: Record<UserRole, string> = {
  Admin: "Admin",
  AssetManager: "Asset Manager",
  DepartmentHead: "Department Head",
  Employee: "Employee",
}

export const rolePermissions = {
  manageOrganization: ["Admin"],
  viewAnalytics: ["Admin"],
  registerAssets: ["Admin", "AssetManager"],
  allocateAssets: ["Admin", "AssetManager", "DepartmentHead"],
  approveTransfers: ["Admin", "AssetManager", "DepartmentHead"],
  requestTransfers: ["Admin", "AssetManager", "DepartmentHead", "Employee"],
  bookResources: ["Admin", "AssetManager", "DepartmentHead", "Employee"],
  raiseMaintenance: ["Admin", "AssetManager", "DepartmentHead", "Employee"],
  manageAudits: ["Admin", "AssetManager"],
} as const

export const can = (
  role: UserRole | undefined,
  action: keyof typeof rolePermissions
) => Boolean(role && (rolePermissions[action] as readonly string[]).includes(role))
