"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  fetchUtilizationReport,
  fetchMaintenanceFrequency,
  fetchAssetUsage,
} from "@/features/reports/api"

const chartConfig = {
  value: {
    label: "Allocations",
    color: "hsl(var(--primary))",
  },
  tickets: {
    label: "Requests",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
  const [utilizationData, setUtilizationData] = useState<any[]>([])
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])
  const [mostUsed, setMostUsed] = useState<any[]>([])
  const [idleAssets, setIdleAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      try {
        const [utilization, maintenance, usage] = await Promise.all([
          fetchUtilizationReport(),
          fetchMaintenanceFrequency(),
          fetchAssetUsage(),
        ])

        // Process utilization data
        const deptData = utilization.data.departments.map((dept: any) => ({
          department: dept.name,
          value: dept._count.allocations + dept._count.bookings,
        }))
        setUtilizationData(deptData)

        // Process maintenance data - group by month
        const maintData = (maintenance.data as any[]).slice(0, 6).map((item: any, index: number) => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index % 6],
          tickets: item.requestCount,
        }))
        setMaintenanceData(maintData)

        // Process usage data
        setMostUsed(usage.data.mostUsed)
        setIdleAssets(usage.data.idle)
      } catch (err) {
        console.error("Failed to load reports:", err)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-10 p-4 md:p-6 lg:p-8 max-w-5xl w-full mx-auto">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Utilization Chart */}
        <div className="bg-muted p-6 rounded-3xl border border-border flex flex-col">
          <h3 className="text-lg font-medium text-foreground mb-6 text-center">Utilization by department</h3>
          <div className="flex-1 min-h-[200px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="department"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Maintenance Frequency Chart */}
        <div className="bg-secondary p-6 rounded-3xl border border-border flex flex-col">
          <h3 className="text-lg font-medium text-foreground mb-6 text-center">Maintenance Frequency</h3>
          <div className="flex-1 min-h-[200px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="var(--color-tickets)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-tickets)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>

      <div className="h-px bg-border w-full"></div>

      {/* Insights Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Most used assets</h3>
          <ul className="space-y-3">
            {mostUsed.length === 0 ? (
              <li className="text-muted-foreground">No usage data available</li>
            ) : (
              mostUsed.slice(0, 5).map((item) => (
                <li key={item.asset?.assetId} className="text-muted-foreground flex gap-2">
                  <span className="font-medium text-foreground">
                    {item.asset?.assetTag}:
                  </span>{" "}
                  {item.allocationCount} allocations
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Idle assets</h3>
          <ul className="space-y-3">
            {idleAssets.length === 0 ? (
              <li className="text-muted-foreground">No idle assets</li>
            ) : (
              idleAssets.slice(0, 5).map((asset) => {
                const daysIdle = Math.floor((Date.now() - new Date(asset.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <li key={asset.assetId} className="text-muted-foreground flex gap-2">
                    <span className="font-medium text-foreground">{asset.assetTag}:</span> unused{" "}
                    {daysIdle > 90 ? `${Math.floor(daysIdle / 30)}+ months` : `${daysIdle} days`}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>

      <div className="h-px bg-border w-full"></div>

      {/* Top Maintenance Items */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Assets with most maintenance requests</h3>
        <ul className="space-y-3">
          {maintenanceData.length === 0 ? (
            <li className="text-muted-foreground">No maintenance data available</li>
          ) : (
            maintenanceData.slice(0, 5).map((item: any, index: number) => (
              <li key={index} className="text-muted-foreground flex gap-2">
                <span className="font-medium text-foreground">
                  {item.asset?.assetTag || `Asset #${item.assetId}`}:
                </span>{" "}
                {item.tickets} maintenance request{item.tickets !== 1 ? "s" : ""}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Export Action */}
      <div className="mt-4">
        <Button className="bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 rounded-full px-8 py-6 h-auto shadow-none font-bold text-base">
          Export report
        </Button>
      </div>
    </div>
  )
}
