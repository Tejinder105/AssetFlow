"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { authenticatedApiRequest } from "@/lib/api"
import type { AuditCycle } from "@/features/audits/schema"
import { apiEnvelopeSchema, paginationSchema } from "@/features/api/schema"
import { z } from "zod"

const cyclesResponseSchema = apiEnvelopeSchema(
  z.object({
    data: z.array(
      z.object({
        auditCycleId: z.number(),
        name: z.string(),
        status: z.enum(["Planned", "Ongoing", "Closed"]),
        startDate: z.string(),
        endDate: z.string(),
        scopeDepartment: z.object({
          departmentId: z.number(),
          name: z.string(),
        }).nullable(),
        auditors: z.array(z.any()).optional(),
        _count: z.object({
          items: z.number(),
          auditors: z.number(),
        }),
      })
    ),
    pagination: paginationSchema,
  })
)

async function fetchAuditCycles(page = 1, limit = 50) {
  return authenticatedApiRequest({
    path: "/api/v1/audits",
    query: { page, limit },
    responseSchema: cyclesResponseSchema,
  })
}

export default function AuditsPage() {
  const router = useRouter()
  const [cycles, setCycles] = useState<AuditCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchAuditCycles()
        setCycles(data.data.data as AuditCycle[])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit cycles")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ongoing":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{status}</Badge>
      case "Closed":
        return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Audit Cycles</h2>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-none font-bold">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Audit
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Audit</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground">Items</TableHead>
              <TableHead className="font-semibold text-foreground">Auditors</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Date Range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No audit cycles found
                </TableCell>
              </TableRow>
            ) : (
              cycles.map((cycle) => (
                <TableRow
                  key={cycle.auditCycleId}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => router.push(`/audits/${cycle.auditCycleId}`)}
                >
                  <TableCell className="font-medium text-foreground py-4">
                    {cycle.name}
                    {cycle.scopeDepartment?.name && (
                      <div className="text-xs text-muted-foreground mt-1">{cycle.scopeDepartment.name}</div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{cycle._count?.items ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground">{cycle._count?.auditors ?? 0}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
