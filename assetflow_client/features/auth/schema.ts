import { z } from "zod"
import { apiEnvelopeSchema } from "@/features/api/schema"

export const userRoleSchema = z.enum([
  "Admin",
  "AssetManager",
  "DepartmentHead",
  "Employee",
])

export const userStatusSchema = z.enum(["Active", "Inactive"])

export const departmentSummarySchema = z
  .object({
    departmentId: z.number(),
    name: z.string(),
  })
  .nullable()

export const userSchema = z.object({
  userId: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  status: userStatusSchema,
  departmentId: z.number().nullable(),
  department: departmentSummarySchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(150, "Name must be at most 150 characters"),
    email: z.string().email("Enter a valid email address").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const loginResponseSchema = apiEnvelopeSchema(
  z.object({
    accessToken: z.string(),
    user: userSchema,
  })
)

export const registerResponseSchema = apiEnvelopeSchema(z.null())

export const refreshResponseSchema = apiEnvelopeSchema(
  z.object({
    accessToken: z.string(),
  })
)

export const meResponseSchema = apiEnvelopeSchema(
  z.object({
    user: userSchema,
  })
)
