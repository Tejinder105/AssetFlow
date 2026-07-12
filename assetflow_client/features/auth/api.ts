import { apiRequest } from "@/lib/api"
import {
  loginResponseSchema,
  loginSchema,
  meResponseSchema,
  refreshResponseSchema,
  registerResponseSchema,
  registerSchema,
} from "@/features/auth/schema"
import type { LoginInput, RegisterInput } from "@/features/auth/types"

export const loginRequest = (payload: LoginInput) =>
  apiRequest({
    path: "/api/auth/login",
    method: "POST",
    body: payload,
    bodySchema: loginSchema,
    responseSchema: loginResponseSchema,
  })

export const registerRequest = (payload: RegisterInput) =>
  apiRequest({
    path: "/api/auth/register",
    method: "POST",
    body: payload,
    bodySchema: registerSchema,
    responseSchema: registerResponseSchema,
  })

export const refreshRequest = () =>
  apiRequest({
    path: "/api/auth/refresh",
    method: "POST",
    responseSchema: refreshResponseSchema,
  })

export const meRequest = (token: string) =>
  apiRequest({
    path: "/api/auth/me",
    token,
    responseSchema: meResponseSchema,
  })

export const logoutRequest = () =>
  apiRequest({
    path: "/api/auth/logout",
    method: "POST",
    responseSchema: registerResponseSchema,
  })
