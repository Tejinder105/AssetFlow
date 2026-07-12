"use client"

import * as React from "react"
import { CalendarIcon, PlusIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

// Timeline configuration
const START_HOUR = 8
const END_HOUR = 18 // 6 PM
const HOUR_HEIGHT = 80 // pixels per hour

// Helper to calculate top and height for booking blocks
function getBlockStyles(startHour: number, durationHours: number) {
  const top = (startHour - START_HOUR) * HOUR_HEIGHT
  const height = durationHours * HOUR_HEIGHT
  return { top: `${top}px`, height: `${height}px` }
}

export default function ResourceBookingPage() {
  // Generate array of hours for the timeline grid [8, 9, 10, ... 18]
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-auto">
      
      {/* Header: Resource Selector */}
      <div className="mb-8 grid gap-2">
        <Label className="text-foreground text-sm font-medium text-muted-foreground">Resource</Label>
        <Input 
          value="Conference room B2 - Tue, 7 Jul" 
          readOnly 
          className="bg-background border-border text-foreground h-11 text-base font-medium max-w-xl"
        />
      </div>

      {/* Timeline Container */}
      <div className="relative border border-border rounded-lg bg-background overflow-hidden mb-8">
        {/* Background Grid */}
        <div className="relative w-full" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
          {hours.map((hour) => {
            if (hour === END_HOUR) return null;
            const displayHour = hour > 12 ? hour - 12 : hour
            
            return (
              <div 
                key={hour} 
                className="absolute w-full border-t border-border flex items-start"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                <div className="w-16 flex-shrink-0 text-right pr-4 pt-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {displayHour}:00
                  </span>
                </div>
              </div>
            )
          })}

          {/* Booking Blocks overlay */}
          <div className="absolute top-0 left-16 right-0 bottom-0 pr-4">
            
            {/* Confirmed Booking (9:00 AM - 10:00 AM) -> start 9, duration 1 */}
            <div 
              className="absolute left-4 right-4 rounded-md border border-[#1264a3]/30 bg-[#1264a3]/10 p-3 z-10 flex items-start"
              style={getBlockStyles(9, 1)}
            >
              <p className="text-sm font-medium text-[#1264a3]">
                Booked - Procurement Team - 9 to 10
              </p>
            </div>

            {/* Conflicting Request (9:30 AM - 10:30 AM) -> start 9.5, duration 1 */}
            <div 
              className="absolute left-6 right-2 rounded-md border-2 border-dashed border-destructive bg-destructive/10 p-3 z-20 flex items-end shadow-sm"
              style={getBlockStyles(9.5, 1)}
            >
              <p className="text-sm font-medium text-destructive">
                Requested 9:30 to 10:30 - conflict - slot is unavailable
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#007a5a] hover:bg-[#007a5a]/90 text-white rounded-full px-8 py-6 h-auto shadow-none font-bold text-base">
              Book a slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Book a slot</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Request a time slot for Conference room B2.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time" className="text-foreground">Start time</Label>
                  <Input id="start-time" type="time" defaultValue="11:00" className="bg-background text-foreground" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time" className="text-foreground">End time</Label>
                  <Input id="end-time" type="time" defaultValue="12:00" className="bg-background text-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purpose" className="text-foreground">Purpose (Optional)</Label>
                <Input id="purpose" placeholder="e.g. Q3 Planning" className="bg-background text-foreground" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-bold w-full">
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
