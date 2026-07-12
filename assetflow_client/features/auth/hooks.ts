import { useAuthStore } from "@/store/auth"

export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () =>
  useAuthStore((state) => Boolean(state.accessToken && state.user))
