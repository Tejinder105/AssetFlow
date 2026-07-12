"use client"

import * as React from "react"
import { CalendarIcon, UploadCloudIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
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
import { ScrollArea } from "@/components/ui/scroll-area"

export function AssetRegistrationSheet({ children }: { children: React.ReactNode }) {
  const [date, setDate] = React.useState<Date>()
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 bg-background border-l-border">
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/50">
          <SheetTitle className="text-xl font-bold text-foreground">Register New Asset</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Enter the details for the new asset. An asset tag has been auto-generated.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="grid gap-6">
            {/* Auto-generated Tag */}
            <div className="grid gap-2">
              <Label htmlFor="asset-tag" className="text-foreground">Asset Tag</Label>
              <Input 
                id="asset-tag" 
                defaultValue="AF-0013" 
                disabled 
                className="bg-muted text-muted-foreground font-mono"
              />
              <p className="text-xs text-muted-foreground">Auto-generated chronological tag.</p>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">Asset Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="e.g. Dell Latitude 7420" className="bg-background text-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-foreground">Category <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger id="category" className="bg-background text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Serial Number */}
              <div className="grid gap-2">
                <Label htmlFor="serial" className="text-foreground">Serial Number</Label>
                <Input id="serial" placeholder="S/N" className="bg-background text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Acquisition Date */}
              <div className="grid gap-2">
                <Label className="text-foreground">Acquisition Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`justify-start text-left font-normal bg-background text-foreground border-border ${!date && "text-muted-foreground"}`}
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

              {/* Acquisition Cost */}
              <div className="grid gap-2">
                <Label htmlFor="cost" className="text-foreground">Cost ($)</Label>
                <Input id="cost" type="number" placeholder="0.00" className="bg-background text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Condition */}
              <div className="grid gap-2">
                <Label htmlFor="condition" className="text-foreground">Condition</Label>
                <Select defaultValue="new">
                  <SelectTrigger id="condition" className="bg-background text-foreground">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Select>
                  <SelectTrigger id="location" className="bg-background text-foreground">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bengaluru">Bengaluru HQ</SelectItem>
                    <SelectItem value="mumbai">Mumbai Branch</SelectItem>
                    <SelectItem value="warehouse">Main Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shared/Bookable Flag */}
            <div className="flex items-center space-x-3 py-2">
              <Switch id="bookable" />
              <Label htmlFor="bookable" className="text-foreground font-normal">
                Make this asset shared/bookable by employees
              </Label>
            </div>

            {/* Documents/Photos */}
            <div className="grid gap-2">
              <Label className="text-foreground">Photos & Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3 text-primary">
                  <UploadCloudIcon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="px-6 py-4 border-t border-border bg-background">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-background">Cancel</Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 rounded-full">Register Asset</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
