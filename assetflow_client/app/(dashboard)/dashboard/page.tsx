"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/features/auth/hooks"
import { can } from "@/lib/permissions"
import { fetchDashboardStats, fetchRecentActivity } from "@/features/dashboard/api"
import type { DashboardStats, ActivityLog } from "@/features/dashboard/schema"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        // router.push("/assets/new") // TODO: Navigate to create asset page
        console.log("Register Asset shortcut triggered")
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [statsData, activityData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivity().catch(() => null),
        ])
        setStats(statsData)
        if (activityData) {
          setActivity(activityData.data.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" role="status" aria-label="Loading dashboard">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const cards = [
    { title: "Allocated", value: stats?.allocatedAssets ?? 0 },
    { title: "Active Bookings", value: stats?.activeBookings ?? 0 },
    { title: "Pending Transfers", value: stats?.pendingTransfers ?? 0 },
    { title: "Overdue Returns", value: stats?.overdueAllocations ?? 0 },
  ]

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Today&apos;s Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-muted/20 shadow-none border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.overdueAllocations ? (
        <div className="p-4 rounded-lg bg-red-100/50 border border-red-200 text-red-500 font-medium flex items-center">
          {stats.overdueAllocations} asset{stats.overdueAllocations === 1 ? "" : "s"} overdue for return — flagged for follow-up
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {can(user?.role, "registerAssets") && (
          <Button size="lg" className="px-6 py-6 text-base bg-brand hover:bg-brand-hover text-brand-foreground border border-zinc-200 shadow-none" onClick={() => console.log('Navigate to /assets/new')}>
            + Register Asset <kbd className="ml-2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-black/10 bg-black/5 px-1.5 font-mono text-[10px] font-medium text-brand-foreground opacity-100">C</kbd>
          </Button>
        )}
        {can(user?.role, "bookResources") && (
          <Button variant="outline" size="lg" className="px-6 py-6 text-base shadow-none">
            Book Resource
          </Button>
        )}
        {can(user?.role, "raiseMaintenance") && (
          <Button variant="outline" size="lg" className="px-6 py-6 text-base shadow-none">
            Raise Request
          </Button>
        )}
      </div>

      {/* Recent Activity */}
      <section className="pt-4">
        <h3 className="text-xl font-medium mb-4 text-foreground">Recent Activity</h3>
        <Card className="shadow-none border-border overflow-hidden">
          <CardContent className="p-0">
            {activity.length === 0 ? (
              <div className="p-6 text-sm text-center text-muted-foreground">No recent activity to show.</div>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((log) => (
                  <li key={log.logId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 text-sm hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="font-medium mr-1 text-foreground capitalize">
                          {log.action.replace(/_/g, " ").toLowerCase()}
                        </span>
                        {log.user && (
                          <span className="text-muted-foreground">
                            — by {log.user.name}
                          </span>
                        )}
                      </div>
                      {log.entityType && (
                        <span className="text-xs text-muted-foreground">
                          {log.entityType} #{log.entityId}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
