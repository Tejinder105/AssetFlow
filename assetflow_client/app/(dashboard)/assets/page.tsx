"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { AssetRegistrationSheet } from "@/components/asset-registration-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrentUser } from "@/features/auth/hooks"
import { can } from "@/lib/permissions"
import { listAssets, listCategories } from "@/services/asset.service"
import type { Asset, AssetCategory } from "@/types/asset"

function StatusBadge({ status }: { status: string }) {
  const tone = status === "Available" ? "bg-emerald-500/10 text-emerald-700" : status === "Allocated" ? "bg-blue-500/10 text-blue-700" : "bg-muted text-muted-foreground"
  return <Badge variant="outline" className={`border-transparent font-normal ${tone}`}>{status}</Badge>
}

export default function AssetsPage() {
  const user = useCurrentUser()
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [categories, setCategories] = React.useState<AssetCategory[]>([])
  const [search, setSearch] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadAssets = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await listAssets({
        limit: 100,
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        status: status === "all" ? undefined : status,
      })
      setAssets(response.data.data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load assets")
    } finally {
      setLoading(false)
    }
  }, [categoryId, search, status])

  React.useEffect(() => { void loadAssets() }, [loadAssets])
  React.useEffect(() => {
    if (!can(user?.role, "registerAssets")) return
    void listCategories().then((response) => setCategories(response.data.items)).catch(() => setCategories([]))
  }, [user?.role])

  const title = user?.role === "Employee" ? "My assets" : user?.role === "DepartmentHead" ? "Department assets" : "Assets"

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">Only assets available to your role are shown.</p>
        </div>
        {can(user?.role, "registerAssets") && (
          <AssetRegistrationSheet categories={categories} onRegistered={() => void loadAssets()}>
            <Button className="rounded-full px-6">+ Register asset</Button>
          </AssetRegistrationSheet>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tag, serial, or name" className="pl-9" />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((category) => <SelectItem key={category.categoryId} value={String(category.categoryId)}>{category.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{["Available", "Allocated", "Reserved", "UnderMaintenance", "Lost", "Retired", "Disposed"].map((value) => <SelectItem key={value} value={value}>{value.replace(/([A-Z])/g, " $1").trim()}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader className="bg-muted"><TableRow><TableHead>Tag</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Holder / location</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading assets…</TableCell></TableRow> : assets.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No assets found.</TableCell></TableRow> : assets.map((asset) => (
              <TableRow key={asset.assetId}>
                <TableCell className="font-mono text-sm">{asset.assetTag}</TableCell><TableCell className="font-medium">{asset.name}</TableCell><TableCell>{asset.category.name}</TableCell><TableCell><StatusBadge status={asset.status} /></TableCell>
                <TableCell className="text-muted-foreground">{asset.holderUser?.name || asset.holderDepartment?.name || asset.location || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
