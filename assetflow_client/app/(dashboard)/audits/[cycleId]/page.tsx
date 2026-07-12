"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchAuditCycle, fetchAuditItems, markAuditItem, closeAuditCycle } from "@/features/audits/api"
import type { AuditCycle, AuditItem } from "@/features/audits/schema"

type VerificationStatus = "Pending" | "Verified" | "Missing" | "Damaged"

export default function AuditCyclePage() {
  const params = useParams()
  const router = useRouter()
  const cycleId = parseInt(params.cycleId as string, 10)

  const [cycle, setCycle] = useState<AuditCycle | null>(null)
  const [items, setItems] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [markedCount, setMarkedCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!cycleId || isNaN(cycleId)) {
        setError("Invalid audit cycle ID")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const [cycleData, itemsData] = await Promise.all([
          fetchAuditCycle(cycleId),
          fetchAuditItems(cycleId, 1, 500),
        ])
        setCycle(cycleData)
        setItems(itemsData.data.items as AuditItem[])

        const flagged = (itemsData.data.items as AuditItem[]).filter(
          i => i.verificationStatus === "Missing" || i.verificationStatus === "Damaged"
        ).length
        setMarkedCount(flagged)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit cycle")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cycleId])

  const handleMarkItem = async (itemId: number, status: VerificationStatus) => {
    try {
      const updated = await markAuditItem(cycleId, itemId, status)
      setItems(prev => prev.map(item => item.auditItemId === itemId ? updated : item))

      const flagged = items.filter(
        i => i.auditItemId === itemId
          ? (status === "Missing" || status === "Damaged")
          : (i.verificationStatus === "Missing" || i.verificationStatus === "Damaged")
      ).length
      setMarkedCount(flagged + (status === "Missing" || status === "Damaged" ? 1 : 0))
    } catch (err) {
      console.error("Failed to mark item:", err)
    }
  }

  const handleCloseCycle = async () => {
    if (!cycle || cycle.status === "Closed") return

    setClosing(true)
    try {
      await closeAuditCycle(cycleId)
      router.push("/audits")
    } catch (err) {
      console.error("Failed to close cycle:", err)
      setClosing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !cycle) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <p className="text-sm text-destructive">{error || "Audit cycle not found"}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/audits")}>
          Back to Audits
        </Button>
      </div>
    )
  }

  const auditorNames = cycle.auditors?.map(a => a.auditor.name).join(", ") ?? "None assigned"
  const isClosed = cycle.status === "Closed"

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-auto">

      {/* Header Card */}
      <div className="bg-muted text-foreground p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold mb-1">{cycle.name}</h2>
        <p className="text-muted-foreground text-sm">
          {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
          {cycle.scopeDepartment?.name ? ` · ${cycle.scopeDepartment.name}` : ""}
          {cycle.scopeLocation ? ` · ${cycle.scopeLocation}` : ""}
        </p>
        <p className="text-muted-foreground text-sm mt-1">Auditors: {auditorNames}</p>
      </div>

      {/* Verification Table */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Asset</TableHead>
              <TableHead className="font-semibold text-foreground">Expected location</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No assets in this audit cycle
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.auditItemId} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-foreground py-4">
                    {item.asset.assetTag} {item.asset.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.asset.location}
                  </TableCell>
                  <TableCell className="text-right">
                    {isClosed ? (
                      <StatusPill status={item.verificationStatus} />
                    ) : (
                      <Select
                        value={item.verificationStatus}
                        onValueChange={(value: VerificationStatus) => handleMarkItem(item.auditItemId, value)}
                      >
                        <SelectTrigger className="w-[140px] mx-auto h-8 rounded-full border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Verified">Verified</SelectItem>
                          <SelectItem value="Missing">Missing</SelectItem>
                          <SelectItem value="Damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Discrepancy Banner */}
      {markedCount > 0 && (
        <div className="bg-[#fff9c4] border border-[#fbc02d]/40 rounded-xl p-4 flex items-center gap-3">
          <AlertCircleIcon className="h-5 w-5 text-[#fbc02d]" />
          <p className="font-medium text-[#f57f17]">
            {markedCount} asset{markedCount > 1 ? "s" : ""} flagged - discrepancy report generated automatically
          </p>
        </div>
      )}

      {/* Action Button */}
      {!isClosed && (
        <div className="pt-2">
          <Button
            onClick={handleCloseCycle}
            disabled={closing}
            className="bg-[#e2f5ec] hover:bg-[#e2f5ec]/80 text-[#007a5a] border border-[#007a5a]/20 rounded-full px-8 py-6 h-auto shadow-none font-bold text-base disabled:opacity-50"
          >
            {closing ? "Closing..." : "Close audit cycle"}
          </Button>
        </div>
      )}

    </div>
  )
}

function StatusPill({ status }: { status: VerificationStatus }) {
  return (
    <span className={`
      inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold rounded-full border
      ${status === 'Verified' ? 'bg-[#e2f5ec] text-[#007a5a] border-[#007a5a]/30' : ''}
      ${status === 'Missing' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
      ${status === 'Damaged' ? 'bg-muted text-muted-foreground border-border' : ''}
      ${status === 'Pending' ? 'bg-muted/50 text-muted-foreground border-border' : ''}
    `}>
      {status}
    </span>
  )
}
