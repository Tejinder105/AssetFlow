"use client"

import * as React from "react"
import { AlertCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const auditItems = [
  { id: "AF-003", name: "Dell laptop", location: "Desk E12", status: "Verified" },
  { id: "AF-9921", name: "Office chair", location: "Desk E14", status: "Missing" },
  { id: "AF-9838", name: "Monitor", location: "Desk E15", status: "Damaged" },
]

export default function AuditPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-auto">
      
      {/* Header Card (Canvas Cream / bg-muted) */}
      <div className="bg-muted text-foreground p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold mb-1">Q3 audit: Engineering dept - 1-15 jul</h2>
        <p className="text-muted-foreground text-sm">Auditors: A. Rao, S. Iqbal</p>
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
            {auditItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20">
                <TableCell className="font-medium text-foreground py-4">
                  {item.id} {item.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.location}
                </TableCell>
                <TableCell className="text-right">
                  {/* Status Pills */}
                  <span className={`
                    inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold rounded-full border
                    ${item.status === 'Verified' ? 'bg-[#e2f5ec] text-[#007a5a] border-[#007a5a]/30' : ''}
                    ${item.status === 'Missing' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                    ${item.status === 'Damaged' ? 'bg-muted text-muted-foreground border-border' : ''}
                  `}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Discrepancy Banner */}
      <div className="bg-[#fff9c4] border border-[#fbc02d]/40 rounded-xl p-4 flex items-center gap-3">
        <AlertCircleIcon className="h-5 w-5 text-[#fbc02d]" />
        <p className="font-medium text-[#f57f17]">
          2 assets flagged - discrepancy report generated automatically
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Button className="bg-[#e2f5ec] hover:bg-[#e2f5ec]/80 text-[#007a5a] border border-[#007a5a]/20 rounded-full px-8 py-6 h-auto shadow-none font-bold text-base">
          Close audit cycle
        </Button>
      </div>

    </div>
  )
}
