"use client"

import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCurrentUser } from "@/features/auth/hooks"
import { can } from "@/lib/permissions"
import { allocateAsset, decideTransfer, listAllocations, listAssets, listEmployees, listTransfers, requestTransfer } from "@/services/asset.service"
import type { Allocation, Asset, EmployeeOption, Transfer } from "@/types/asset"

const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString() : "—"
const recipient = (allocation: Allocation) => allocation.allocatedToUser?.name || allocation.allocatedToDepartment?.name || "—"

export default function AllocationPage() {
  const user = useCurrentUser()
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([])
  const [allocations, setAllocations] = React.useState<Allocation[]>([])
  const [transfers, setTransfers] = React.useState<Transfer[]>([])
  const [selectedAsset, setSelectedAsset] = React.useState("")
  const [recipientId, setRecipientId] = React.useState("")
  const [returnDate, setReturnDate] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [assetResult, employeeResult, allocationResult, transferResult] = await Promise.all([
        listAssets({ limit: 100 }), listEmployees(), listAllocations(), listTransfers(),
      ])
      setAssets(assetResult.data.data)
      setEmployees(employeeResult.data.items)
      setAllocations(allocationResult.data.data)
      setTransfers(transferResult.data.data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load allocation data")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { void load() }, [load])

  const asset = assets.find((item) => item.assetId === Number(selectedAsset))
  const mayAllocate = can(user?.role, "allocateAssets")
  const mayApprove = can(user?.role, "approveTransfers")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!asset || !recipientId) {
      toast.error("Choose an asset and recipient")
      return
    }
    setSaving(true)
    try {
      if (asset.status === "Available" && mayAllocate) {
        await allocateAsset({ assetId: asset.assetId, allocatedToUserId: Number(recipientId), expectedReturnDate: returnDate || undefined })
        toast.success("Asset allocated")
      } else {
        await requestTransfer({ assetId: asset.assetId, requestedToUserId: Number(recipientId), reason: reason || undefined })
        toast.success("Transfer request submitted")
      }
      setSelectedAsset("")
      setRecipientId("")
      setReturnDate("")
      setReason("")
      await load()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save request")
    } finally {
      setSaving(false)
    }
  }

  async function resolveTransfer(transferId: number, approve: boolean) {
    try {
      await decideTransfer(transferId, approve)
      toast.success(approve ? "Transfer approved" : "Transfer rejected")
      await load()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update transfer")
    }
  }

  const formTitle = asset?.status === "Available" && mayAllocate ? "Allocate asset" : "Request transfer"

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
      <div><h2 className="text-2xl font-semibold">Allocation & transfers</h2><p className="text-sm text-muted-foreground">Requests and allocations are scoped to your role and department.</p></div>
      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <form onSubmit={submit} className="grid gap-5 rounded-lg border p-5">
        <h3 className="text-lg font-medium">{formTitle}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2"><Label>Asset</Label><Select value={selectedAsset} onValueChange={setSelectedAsset}><SelectTrigger><SelectValue placeholder="Choose an available asset or allocated asset to transfer" /></SelectTrigger><SelectContent>{assets.map((item) => <SelectItem key={item.assetId} value={String(item.assetId)}>{item.assetTag} — {item.name} ({item.status})</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-2"><Label>Recipient</Label><Select value={recipientId} onValueChange={setRecipientId}><SelectTrigger><SelectValue placeholder="Choose employee" /></SelectTrigger><SelectContent>{employees.filter((item) => item.userId !== user?.userId).map((item) => <SelectItem key={item.userId} value={String(item.userId)}>{item.name}{item.department ? ` — ${item.department.name}` : ""}</SelectItem>)}</SelectContent></Select></div>
        </div>
        {asset?.status === "Available" && mayAllocate ? <div className="grid max-w-sm gap-2"><Label htmlFor="return-date">Expected return date (optional)</Label><Input id="return-date" type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></div> : <div className="grid gap-2"><Label htmlFor="transfer-reason">Reason</Label><Textarea id="transfer-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this transfer needed?" /></div>}
        <div><Button type="submit" disabled={saving || loading}>{saving ? "Saving…" : formTitle}</Button></div>
      </form>

      <section className="space-y-3"><div><h3 className="text-lg font-medium">Current allocations</h3><p className="text-sm text-muted-foreground">{user?.role === "Employee" ? "Assets allocated to you" : user?.role === "DepartmentHead" ? "Assets allocated within your department" : "Organization allocations"}</p></div>
        <div className="overflow-hidden rounded-md border"><Table><TableHeader className="bg-muted"><TableRow><TableHead>Asset</TableHead><TableHead>Allocated to</TableHead><TableHead>Allocated on</TableHead><TableHead>Return due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">Loading…</TableCell></TableRow> : allocations.length === 0 ? <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No allocations found.</TableCell></TableRow> : allocations.map((item) => <TableRow key={item.allocationId}><TableCell className="font-medium">{item.asset.assetTag} — {item.asset.name}</TableCell><TableCell>{recipient(item)}</TableCell><TableCell>{formatDate(item.allocationDate)}</TableCell><TableCell>{formatDate(item.expectedReturnDate)}</TableCell><TableCell><Badge variant="outline">{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
      </section>

      <section className="space-y-3"><div><h3 className="text-lg font-medium">Transfer requests</h3><p className="text-sm text-muted-foreground">Pending requests can be approved by the authorized role.</p></div>
        <div className="overflow-hidden rounded-md border"><Table><TableHeader className="bg-muted"><TableRow><TableHead>Asset</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Requested by</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={6} className="h-20 text-center text-muted-foreground">Loading…</TableCell></TableRow> : transfers.length === 0 ? <TableRow><TableCell colSpan={6} className="h-20 text-center text-muted-foreground">No transfer requests found.</TableCell></TableRow> : transfers.map((item) => <TableRow key={item.transferId}><TableCell className="font-medium">{item.asset.assetTag} — {item.asset.name}</TableCell><TableCell>{item.currentHolder?.name || "Unassigned"}</TableCell><TableCell>{item.requestedTo.name}</TableCell><TableCell>{item.requester.name}</TableCell><TableCell><Badge variant="outline">{item.status}</Badge></TableCell><TableCell>{item.status === "Requested" && mayApprove && <div className="flex gap-2"><Button size="sm" onClick={() => void resolveTransfer(item.transferId, true)}>Approve</Button><Button size="sm" variant="outline" onClick={() => void resolveTransfer(item.transferId, false)}>Reject</Button></div>}</TableCell></TableRow>)}</TableBody></Table></div>
      </section>
    </div>
  )
}
