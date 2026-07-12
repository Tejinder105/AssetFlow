"use client"

import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchDashboardStats, fetchRecentActivity } from "@/features/dashboard/api"
import type { DashboardStats, ActivityLog } from "@/features/dashboard/schema"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <div className="flex flex-1 items-center justify-center p-8">
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
        <Button size="lg" className="px-6 py-6 text-base bg-[#d5f3eb] hover:bg-[#b8e8db] text-zinc-900 border border-zinc-200 shadow-none">
          + Register Asset
        </Button>
        <Button variant="outline" size="lg" className="px-6 py-6 text-base shadow-none">
          Book Resource
        </Button>
        <Button variant="outline" size="lg" className="px-6 py-6 text-base shadow-none">
          Raise Request
        </Button>
      </div>

      {/* Recent Activity */}
      <section className="pt-4">
        <h3 className="text-xl font-medium mb-4">Recent Activity</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity to show.</p>
        ) : (
          <div className="space-y-3">
            {activity.map((log) => (
              <div key={log.logId} className="text-sm">
                <span className="font-medium mr-1 text-foreground">
                  {log.action.replace(/_/g, " ").toLowerCase()}
                </span>
                {log.user && (
                  <span className="text-muted-foreground">
                    — by {log.user.name}
                  </span>
                )}
                <span className="text-muted-foreground ml-2 text-xs">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
