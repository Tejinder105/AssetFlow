"use client"

import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssetRegistrationSheet } from "@/components/asset-registration-sheet"

const assets = [
  { id: "AF-0012", name: "Dell Laptop", category: "Electronics", status: "Allocated", location: "Bengaluru" },
  { id: "AF-0062", name: "Projector", category: "Electronics", status: "Maintenance", location: "HQ floor 2" },
  { id: "AF-0201", name: "Office chair", category: "Furniture", status: "Available", location: "Warehouse" },
]

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return (
        <Badge variant="outline" className="bg-[#007a5a]/10 hover:bg-[#007a5a]/10 text-[#007a5a] border-transparent font-normal rounded-full px-4 py-0.5 shadow-none">
          {status}
        </Badge>
      )
    case "allocated":
      return (
        <Badge variant="outline" className="bg-[#1264a3]/10 hover:bg-[#1264a3]/10 text-[#1264a3] border-transparent font-normal rounded-full px-4 py-0.5 shadow-none">
          {status}
        </Badge>
      )
    case "maintenance":
      return (
        <Badge variant="outline" className="bg-[#b45309]/10 hover:bg-[#b45309]/10 text-[#b45309] border-transparent font-normal rounded-full px-4 py-0.5 shadow-none">
          {status}
        </Badge>
      )
    case "reserved":
      return (
        <Badge variant="outline" className="bg-[#611f69]/10 hover:bg-[#611f69]/10 text-[#611f69] border-transparent font-normal rounded-full px-4 py-0.5 shadow-none">
          {status}
        </Badge>
      )
    case "lost":
    case "retired":
    case "disposed":
      return (
        <Badge variant="outline" className="bg-[#cc4117]/10 hover:bg-[#cc4117]/10 text-[#cc4117] border-transparent font-normal rounded-full px-4 py-0.5 shadow-none">
          {status}
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-muted hover:bg-muted text-muted-foreground border-transparent font-normal rounded-full px-4 py-0.5 shadow-none">
          {status}
        </Badge>
      )
  }
}

export default function AssetsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
      
      {/* Header Row: Search & Register */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by tag, serial, or QR code.." 
            className="pl-9 bg-background border-border text-foreground h-10 w-full"
          />
        </div>
        <AssetRegistrationSheet>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-7 shadow-none font-bold whitespace-nowrap">
            + Register Asset
          </Button>
        </AssetRegistrationSheet>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select>
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground rounded-full h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="vehicles">Vehicles</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground rounded-full h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="allocated">Allocated</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground rounded-full h-9">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="facilities">Facilities</SelectItem>
            <SelectItem value="field-ops">Field Ops</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto hover:bg-muted/50">
          <SlidersHorizontalIcon className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-md border border-border bg-background overflow-hidden mt-2">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="border-b-border hover:bg-transparent">
              <TableHead className="font-medium text-foreground h-11 w-[120px]">Tag</TableHead>
              <TableHead className="font-medium text-foreground h-11">Name</TableHead>
              <TableHead className="font-medium text-foreground h-11">Category</TableHead>
              <TableHead className="font-medium text-foreground h-11">Status</TableHead>
              <TableHead className="font-medium text-foreground h-11">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} className="border-b-border group cursor-pointer hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground py-3">
                  <span className="font-mono text-sm">{asset.id}</span>
                </TableCell>
                <TableCell className="text-foreground font-medium py-3">{asset.name}</TableCell>
                <TableCell className="text-muted-foreground py-3">{asset.category}</TableCell>
                <TableCell className="py-3">
                  {getStatusBadge(asset.status)}
                </TableCell>
                <TableCell className="text-muted-foreground py-3">{asset.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
    </div>
  )
}
