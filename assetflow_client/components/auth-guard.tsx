"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { Loader2Icon } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const status = useAuthStore((state) => state.status)
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = useAuthStore.getState().accessToken
      if (!token) {
        router.replace("/login")
        setChecking(false)
        return
      }

      try {
        await loadCurrentUser()
      } catch {
        router.replace("/login")
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [router, loadCurrentUser])

  // Still checking → show spinner
  if (checking || status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Unauthenticated after check → blank (redirect is happening)
  if (status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}
