"use client"

import { useEffect, useState, useCallback } from "react"
import { CalendarIcon, Loader2Icon } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCalendar, createBooking } from "@/features/bookings/api"
import type { Booking } from "@/features/bookings/schema"

// Timeline configuration
const START_HOUR = 8
const END_HOUR = 18 // 6 PM
const HOUR_HEIGHT = 80 // pixels per hour

// Helper to calculate top and height for booking blocks
function getBlockStyles(startTime: string, endTime: string) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  const duration = endHour - startHour

  const top = (startHour - START_HOUR) * HOUR_HEIGHT
  const height = duration * HOUR_HEIGHT
  return { top: `${top}px`, height: `${height}px` }
}

export default function ResourceBookingPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [startTime, setStartTime] = useState("11:00")
  const [endTime, setEndTime] = useState("12:00")
  const [purpose, setPurpose] = useState("")

  // Generate array of hours for the timeline grid [8, 9, 10, ... 18]
  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  )

  const loadBookings = useCallback(async () => {
    if (!selectedAssetId) return

    setLoading(true)
    try {
      const response = await getCalendar({
        assetId: selectedAssetId,
        startDate: selectedDate,
        endDate: selectedDate,
      })
      setBookings(response.data.bookings as Booking[])
    } catch (err) {
      console.error("Failed to load bookings:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedAssetId, selectedDate])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleCreateBooking = async () => {
    if (!selectedAssetId) return

    setSubmitting(true)
    try {
      const startDateTime = new Date(selectedDate)
      const [startHour, startMin] = startTime.split(":")
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0)

      const endDateTime = new Date(selectedDate)
      const [endHour, endMin] = endTime.split(":")
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0)

      await createBooking({
        assetId: selectedAssetId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      })

      // Reload bookings after successful creation
      loadBookings()

      // Reset form
      setStartTime("11:00")
      setEndTime("12:00")
      setPurpose("")

      // Close dialog (simple way - in real app you'd use open state)
      ;(document.activeElement as HTMLElement)?.blur()
    } catch (err) {
      console.error("Failed to create booking:", err)
      alert(err instanceof Error ? err.message : "Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  const displayDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-auto">

      {/* Header: Resource & Date Selector */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-foreground text-sm font-medium text-muted-foreground">
            Resource
          </Label>
          <Select
            value={selectedAssetId?.toString() ?? ""}
            onValueChange={(v) => setSelectedAssetId(parseInt(v, 10))}
          >
            <SelectTrigger className="bg-background border-border text-foreground h-11 text-base font-medium">
              <SelectValue placeholder="Select a resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Conference room B2</SelectItem>
              <SelectItem value="2">Meeting room A1</SelectItem>
              <SelectItem value="3">Training Hall</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="text-foreground text-sm font-medium text-muted-foreground">
            Date
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background border-border text-foreground h-11 text-base font-medium"
          />
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative border border-border rounded-lg bg-background overflow-hidden mb-8">
        <div
          className="relative w-full"
          style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
        >
          {hours.map((hour) => {
            if (hour === END_HOUR) return null
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              bookings.map((booking) => {
                const statusColor =
                  booking.status === "Cancelled"
                    ? "border-gray-300 bg-gray-100 text-gray-500"
                    : booking.status === "Completed"
                    ? "border-green-300 bg-green-100 text-green-700"
                    : "border-[#1264a3]/30 bg-[#1264a3]/10 text-[#1264a3]"

                return (
                  <div
                    key={booking.bookingId}
                    className={`absolute left-4 right-4 rounded-md border p-3 z-10 flex items-start ${statusColor}`}
                    style={getBlockStyles(booking.startTime, booking.endTime)}
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        {booking.asset.name} - {booking.bookedBy.name}
                      </p>
                      <p className="text-xs opacity-80">
                        {new Date(booking.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {new Date(booking.endTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={!selectedAssetId}
              className="bg-[#007a5a] hover:bg-[#007a5a]/90 text-white rounded-full px-8 py-6 h-auto shadow-none font-bold text-base disabled:opacity-50"
            >
              Book a slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Book a slot</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Request a time slot for {displayDate}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time" className="text-foreground">
                    Start time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time" className="text-foreground">
                    End time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purpose" className="text-foreground">
                  Purpose (Optional)
                </Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Q3 Planning"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreateBooking}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-bold w-full"
              >
                {submitting ? "Creating..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
