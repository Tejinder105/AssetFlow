"use client"

import * as React from "react"
import { AlertCircleIcon, SearchIcon, CalendarIcon, ArrowRightLeftIcon, HistoryIcon, CheckCircle2Icon } from "lucide-react"
import { format } from "date-fns"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export default function AllocationPage() {
  // For demonstration: toggle this switch to see both states.
  const [isAssetAllocated, setIsAssetAllocated] = React.useState(true)
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-auto">
      
      {/* Dev toggle (hidden from real users, just for us to test both states) */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-[-1rem]">
        <Label htmlFor="dev-toggle" className="text-xs">Mock state: Asset is Allocated</Label>
        <Switch id="dev-toggle" checked={isAssetAllocated} onCheckedChange={setIsAssetAllocated} />
      </div>

      <div className="flex flex-col gap-6">
        {/* Asset Selection */}
        <div className="grid gap-2">
          <Label className="text-foreground text-base">Asset</Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={isAssetAllocated ? "AF-0114 - Dell laptop" : "AF-0201 - Office chair"}
              readOnly
              className="pl-9 bg-background border-border text-foreground h-11 text-base font-medium"
            />
          </div>
        </div>

        {/* Double-Allocation Conflict Block */}
        {isAssetAllocated && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mt-2">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="text-base font-medium text-destructive">
                  Already Allocated to Priya shah (Engineering)
                </h4>
                <p className="text-sm text-destructive/80 mt-1">
                  Direct re-allocation is blocked - submit a transfer request below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Form (Transfer or Direct Allocate) */}
        <div className="mt-4">
          <h3 className="text-lg font-medium text-foreground mb-4">
            {isAssetAllocated ? "Transfer Request" : "Direct Allocation"}
          </h3>
          
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Field */}
              <div className="grid gap-2">
                <Label className="text-foreground">From</Label>
                <Input 
                  value={isAssetAllocated ? "Priya Shah" : "Warehouse (Available)"} 
                  disabled 
                  className="bg-muted text-muted-foreground border-transparent h-10"
                />
              </div>

              {/* To Field */}
              <div className="grid gap-2">
                <Label className="text-foreground">To <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-background border-border text-foreground h-10">
                    <SelectValue placeholder="Select Employee...." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raj">Raj Patel (Design)</SelectItem>
                    <SelectItem value="aditi">Aditi Rao (Engineering)</SelectItem>
                    <SelectItem value="rohan">Rohan Mehta (Facilities)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditional Fields based on state */}
            {isAssetAllocated ? (
              <div className="grid gap-2">
                <Label className="text-foreground">Reason</Label>
                <Textarea 
                  placeholder="Why is this transfer needed? (e.g., Priya is moving to a new team)"
                  className="min-h-[120px] bg-background border-border text-foreground resize-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="text-foreground">Expected Return Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`justify-start text-left font-normal bg-background text-foreground border-border h-10 ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="bg-background text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div>
              <Button className={
                isAssetAllocated 
                  ? "bg-[#007a5a] hover:bg-[#007a5a]/90 text-white rounded-md px-6 shadow-none font-medium h-10" // Using the green from mockup for Submit Request
                  : "bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6 shadow-none font-medium h-10"
              }>
                {isAssetAllocated ? "Submit Request" : "Allocate Asset"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="my-2 border-t border-border"></div>

      {/* Allocation History Log */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <HistoryIcon className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-medium text-foreground">Allocation history</h3>
        </div>
        
        <div className="flex flex-col gap-6 pl-2">
          {isAssetAllocated ? (
            <>
              <div className="relative pl-6 border-l-2 border-border pb-6">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary"></div>
                <p className="text-sm text-foreground font-medium">Allocated to Priya shah - Engineering</p>
                <p className="text-sm text-muted-foreground mt-1">Mar 12, 2026</p>
              </div>
              <div className="relative pl-6 border-l-2 border-transparent">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-muted-foreground"></div>
                <p className="text-sm text-foreground">Returned by Arjun Nair - condition: good</p>
                <p className="text-sm text-muted-foreground mt-1">Jan 04, 2026</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative pl-6 border-l-2 border-border pb-6">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary"></div>
                <p className="text-sm text-foreground font-medium">Added to Inventory (Warehouse)</p>
                <p className="text-sm text-muted-foreground mt-1">Apr 01, 2026</p>
              </div>
            </>
          )}
        </div>
      </div>
      
    </div>
  )
}
