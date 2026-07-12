"use client"

import * as React from "react"

const filters = ["All", "Alerts", "Approvals", "Bookings"]

type Notification = {
  id: string
  text: string
  time: string
  type: "assignment" | "approval" | "transfer" | "warning"
}

const notifications: Notification[] = [
  {
    id: "n1",
    text: "Laptop AF-0014 assigned to Priya shah",
    time: "2m ago",
    type: "assignment",
  },
  {
    id: "n2",
    text: "Maintenance request AF-0055 approved",
    time: "18m ago",
    type: "approval",
  },
  {
    id: "n3",
    text: "Booking confirmed : Room B2 : 2:00 to 3:00 PM",
    time: "1h ago",
    type: "assignment", // Using blue for bookings as per sketch
  },
  {
    id: "n4",
    text: "Transfer approved : AF-0033 to facilities dept",
    time: "3h ago",
    type: "transfer", // Red/pink
  },
  {
    id: "n5",
    text: "Overdue return : AF-0021 was due 3 days ago",
    time: "1d ago",
    type: "warning", // Yellow/Orange
  },
  {
    id: "n6",
    text: "audit discrepancy flagged : AF-0088 damaged",
    time: "2d ago",
    type: "warning", // Yellow/Orange
  },
]

function getIndicatorColor(type: Notification["type"]) {
  switch (type) {
    case "assignment":
      return "bg-[#bfdbfe] border-[#93c5fd]" // Light Blue
    case "approval":
      return "bg-[#bbf7d0] border-[#86efac]" // Light Green
    case "transfer":
      return "bg-[#fecdd3] border-[#fda4af]" // Light Red/Pink
    case "warning":
      return "bg-[#fef08a] border-[#fde047]" // Light Yellow/Orange
    default:
      return "bg-muted border-border"
  }
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = React.useState("All")

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-auto">
      
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filters.map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-6 py-1.5 rounded-full text-sm font-semibold border transition-colors
                ${isActive 
                  ? 'bg-[#e2f5ec] text-[#007a5a] border-[#007a5a]/30' // Match "All" pill sketch (greenish)
                  : 'bg-[#fff5f5] text-muted-foreground border-border hover:bg-muted/80' // Light pinkish cream
                }
              `}
            >
              {filter}
            </button>
          )
        })}
      </div>

      {/* Notifications Feed */}
      <div className="flex flex-col">
        {/* Top border line */}
        <div className="h-px w-full bg-border" />
        
        {notifications.map((notif) => (
          <div key={notif.id} className="group relative">
            <div className="flex items-center justify-between py-4 px-2 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                {/* Colored Indicator Square */}
                <div 
                  className={`w-3 h-3 rounded-[3px] border ${getIndicatorColor(notif.type)}`}
                  aria-hidden="true"
                />
                
                {/* Notification Text */}
                <span className="text-base text-foreground font-medium">
                  {notif.text}
                </span>
              </div>
              
              {/* Timestamp */}
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap ml-4">
                {notif.time}
              </span>
            </div>
            
            {/* Divider line */}
            <div className="h-px w-full bg-border" />
          </div>
        ))}
      </div>

    </div>
  )
}
