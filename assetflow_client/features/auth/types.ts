import { z } from "zod"
import {
  loginSchema,
  registerSchema,
  userRoleSchema,
  userSchema,
  userStatusSchema,
} from "@/features/auth/schema"

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UserStatus = z.infer<typeof userStatusSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
