import { z } from "zod"
import {
  maintenanceRequestSchema,
  maintenancePrioritySchema,
  maintenanceStatusSchema,
  raiseRequestSchema,
  assignTechnicianSchema,
  resolveRequestSchema,
} from "@/features/maintenance/schema"

export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>
export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>
export type RaiseRequestInput = z.infer<typeof raiseRequestSchema>
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>
export type ResolveRequestInput = z.infer<typeof resolveRequestSchema>
