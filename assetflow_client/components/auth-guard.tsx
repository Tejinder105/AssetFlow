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
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // No persisted token — go straight to login
    if (!accessToken) {
      router.replace("/login")
      return
    }

    // Token exists — validate it (will auto-refresh if expired)
    loadCurrentUser()
      .then(() => setChecked(true))
      .catch(() => router.replace("/login"))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Still checking → show spinner
  if (!checked || status === "loading" || status === "idle") {
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
