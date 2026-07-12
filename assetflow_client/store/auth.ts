import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
} from "@/features/auth/api"
import type { LoginInput, RegisterInput, User } from "@/features/auth/types"

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"

type AuthState = {
  accessToken: string | null
  user: User | null
  status: AuthStatus
  error: string | null
  login: (payload: LoginInput) => Promise<void>
  register: (payload: RegisterInput) => Promise<void>
  loadCurrentUser: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      status: "idle",
      error: null,

      login: async (payload) => {
        set({ status: "loading", error: null })
        try {
          const response = await loginRequest(payload)
          set({
            accessToken: response.data.accessToken,
            user: response.data.user,
            status: "authenticated",
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to log in"
          set({ error: message, status: "unauthenticated", user: null })
          throw error
        }
      },

      register: async (payload) => {
        set({ status: "loading", error: null })
        try {
          await registerRequest(payload)
          set({ status: "unauthenticated" })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to create account"
          set({ error: message, status: "unauthenticated" })
          throw error
        }
      },

      loadCurrentUser: async () => {
        const token = get().accessToken
        if (!token) {
          set({ status: "unauthenticated", user: null })
          return
        }

        set({ status: "loading", error: null })
        try {
          const response = await meRequest(token)
          set({ user: response.data.user, status: "authenticated" })
        } catch {
          const nextToken = await get().refreshAccessToken()
          if (!nextToken) {
            return
          }
          const response = await meRequest(nextToken)
          set({ user: response.data.user, status: "authenticated" })
        }
      },

      refreshAccessToken: async () => {
        try {
          const response = await refreshRequest()
          set({ accessToken: response.data.accessToken })
          return response.data.accessToken
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Session expired"
          set({
            accessToken: null,
            user: null,
            status: "unauthenticated",
            error: message,
          })
          return null
        }
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({
            accessToken: null,
            user: null,
            status: "unauthenticated",
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "assetflow-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
)
