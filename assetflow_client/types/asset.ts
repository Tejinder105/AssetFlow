export type Asset = {
  assetId: number
  assetTag: string
  name: string
  serialNumber: string | null
  status: string
  condition: string | null
  location: string | null
  isBookable: boolean
  category: { categoryId: number; name: string }
  holderUser: { userId: number; name: string } | null
  holderDepartment: { departmentId: number; name: string } | null
}

export type AssetCategory = { categoryId: number; name: string }

export type EmployeeOption = {
  userId: number
  name: string
  email: string
  departmentId: number | null
  department: { departmentId: number; name: string } | null
}

export type Allocation = {
  allocationId: number
  allocationDate: string
  expectedReturnDate: string | null
  actualReturnDate: string | null
  returnConditionNotes: string | null
  status: string
  asset: Pick<Asset, "assetId" | "assetTag" | "name" | "status">
  allocatedToUser: EmployeeOption | null
  allocatedToDepartment: { departmentId: number; name: string } | null
  allocator: { userId: number; name: string }
}

export type Transfer = {
  transferId: number
  status: string
  reason: string | null
  createdAt: string
  asset: Pick<Asset, "assetId" | "assetTag" | "name">
  currentHolder: { userId: number; name: string } | null
  requestedTo: { userId: number; name: string }
  requester: { userId: number; name: string }
  approver: { userId: number; name: string } | null
}
