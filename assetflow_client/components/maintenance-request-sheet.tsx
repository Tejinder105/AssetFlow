"use client"

import * as React from "react"
import { UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { ScrollArea } from "@/components/ui/scroll-area"

export function MaintenanceRequestSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 bg-background border-l-border">
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/50">
          <SheetTitle className="text-xl font-bold text-foreground">Raise Maintenance Request</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Report an issue with an asset to route it for approval and repair.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="grid gap-6">
            
            {/* Select Asset */}
            <div className="grid gap-2">
              <Label htmlFor="asset" className="text-foreground">Asset <span className="text-destructive">*</span></Label>
              <Select>
                <SelectTrigger id="asset" className="bg-background text-foreground border-border h-11">
                  <SelectValue placeholder="Search or select asset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="af-0062">AF-0062 - Projector</SelectItem>
                  <SelectItem value="af-003">AF-003 - AC Unit</SelectItem>
                  <SelectItem value="af-0078">AF-0078 - Forklift</SelectItem>
                  <SelectItem value="af-897">AF-897 - Printer</SelectItem>
                  <SelectItem value="af-873">AF-873 - Office Chair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Describe Issue */}
            <div className="grid gap-2">
              <Label htmlFor="issue" className="text-foreground">Describe Issue <span className="text-destructive">*</span></Label>
              <Textarea 
                id="issue"
                placeholder="What exactly is wrong with it?"
                className="min-h-[120px] bg-background text-foreground border-border resize-none"
              />
            </div>

            {/* Set Priority */}
            <div className="grid gap-2">
              <Label htmlFor="priority" className="text-foreground">Priority</Label>
              <Select defaultValue="medium">
                <SelectTrigger id="priority" className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Cosmetic/Minor)</SelectItem>
                  <SelectItem value="medium">Medium (Standard Repair)</SelectItem>
                  <SelectItem value="high">High (Blocks Work)</SelectItem>
                  <SelectItem value="critical">Critical (Safety/Severe)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attach Photo */}
            <div className="grid gap-2">
              <Label className="text-foreground">Attach Photo/Document</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3 text-primary">
                  <UploadCloudIcon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">Image or PDF showing the damage (max. 10MB)</p>
              </div>
            </div>

          </div>
        </ScrollArea>
        
        <SheetFooter className="px-6 py-4 border-t border-border bg-background">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-background rounded-full px-6">Cancel</Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 rounded-full shadow-none">Submit Request</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
