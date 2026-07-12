"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const utilizationData = [
  { department: "Engineering", value: 85 },
  { department: "Facilities", value: 120 },
  { department: "Sales", value: 65 },
  { department: "HR", value: 40 },
  { department: "Marketing", value: 90 },
]

const maintenanceData = [
  { month: "Jan", tickets: 12 },
  { month: "Feb", tickets: 25 },
  { month: "Mar", tickets: 18 },
  { month: "Apr", tickets: 42 },
  { month: "May", tickets: 30 },
  { month: "Jun", tickets: 48 },
]

const chartConfig = {
  value: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
  tickets: {
    label: "Tickets",
    color: "hsl(var(--destructive))",
  }
} satisfies ChartConfig

export default function ReportsPage() {
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
            <li className="text-muted-foreground flex gap-2">
              <span className="font-medium text-foreground">Room B2:</span> 34 bookings this month
            </li>
            <li className="text-muted-foreground flex gap-2">
              <span className="font-medium text-foreground">Van AF-343:</span> 21 trips this month
            </li>
            <li className="text-muted-foreground flex gap-2">
              <span className="font-medium text-foreground">Projector AF-335:</span> 18 uses
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Idle assets</h3>
          <ul className="space-y-3">
            <li className="text-muted-foreground flex gap-2">
              <span className="font-medium text-foreground">Camera AF-0301:</span> unused 60+ days
            </li>
            <li className="text-muted-foreground flex gap-2">
              <span className="font-medium text-foreground">Chair AF-0410:</span> unused 45 days
            </li>
          </ul>
        </div>
      </div>

      <div className="h-px bg-border w-full"></div>

      {/* Due for Maintenance */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Assets due for maintenance / nearing retirement</h3>
        <ul className="space-y-3">
          <li className="text-muted-foreground flex gap-2">
            <span className="font-medium text-foreground">Forklift AF-0087:</span> service due in 5 days
          </li>
          <li className="text-muted-foreground flex gap-2">
            <span className="font-medium text-foreground">Laptop AF-0020:</span> 4 years old : nearing retirement
          </li>
        </ul>
      </div>

      {/* Export Action */}
      <div className="mt-4">
        {/* Soft pastel secondary button matching DESIGN.md secondary pill */}
        <Button className="bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 rounded-full px-8 py-6 h-auto shadow-none font-bold text-base">
          Export report
        </Button>
      </div>

    </div>
  )
}
