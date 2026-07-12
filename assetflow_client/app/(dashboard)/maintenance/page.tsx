"use client"

import * as React from "react"
import { PlusIcon, Loader2Icon } from "lucide-react"
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { MaintenanceRequestSheet } from "@/components/maintenance-request-sheet"
import {
  listMaintenanceRequests,
  approveMaintenanceRequest,
  assignTechnician,
  updateProgress,
  resolveMaintenanceRequest,
} from "@/features/maintenance/api"
import type { MaintenanceRequest } from "@/features/maintenance/schema"

// -- Types --
type Column = {
  id: string
  title: string
  status: string
}

const COLUMNS: Column[] = [
  { id: "pending", title: "Pending", status: "Pending" },
  { id: "approved", title: "Approved", status: "Approved" },
  { id: "assigned", title: "Technician assigned", status: "TechnicianAssigned" },
  { id: "progress", title: "in progress", status: "InProgress" },
  { id: "resolved", title: "Resolved", status: "Resolved" },
]

// -- Sortable Item Component --
function SortableTaskCard({
  task,
  onAction,
}: {
  task: MaintenanceRequest
  onAction: (id: number, newStatus: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.requestId, data: { type: "Task", task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isResolved = task.status === "Resolved"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-4 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing text-left mb-3
        ${isDragging ? "opacity-50 border-primary" : "opacity-100"}
        ${
          isResolved
            ? "bg-[#d1f4e0] border-[#007a5a]/20 text-[#007a5a]"
            : "bg-background border-border hover:border-muted-foreground/30"
        }
      `}
    >
      <div className={`font-semibold text-sm ${isResolved ? "text-[#007a5a]" : "text-foreground"}`}>
        {task.asset?.assetTag || `#${task.assetId}`}
      </div>
      <div className={`text-sm mt-1 leading-snug ${isResolved ? "text-[#007a5a]/90" : "text-muted-foreground"}`}>
        {task.issueDescription}
      </div>
      {task.technicianName && (
        <div className={`text-xs mt-1 ${isResolved ? "text-[#007a5a]/80" : "text-muted-foreground"}`}>
          Tech: {task.technicianName}
        </div>
      )}
    </div>
  )
}

// -- Static Card for Drag Overlay --
function TaskCard({ task }: { task: MaintenanceRequest }) {
  const isResolved = task.status === "Resolved"
  return (
    <div
      className={`
        p-4 rounded-lg border shadow-lg text-left
        ${
          isResolved
            ? "bg-[#d1f4e0] border-[#007a5a]/20 text-[#007a5a]"
            : "bg-background border-border"
        }
      `}
    >
      <div className={`font-semibold text-sm ${isResolved ? "text-[#007a5a]" : "text-foreground"}`}>
        {task.asset?.assetTag || `#${task.assetId}`}
      </div>
      <div className={`text-sm mt-1 leading-snug ${isResolved ? "text-[#007a5a]/90" : "text-muted-foreground"}`}>
        {task.issueDescription}
      </div>
      {task.technicianName && (
        <div className={`text-xs mt-1 ${isResolved ? "text-[#007a5a]/80" : "text-muted-foreground"}`}>
          Tech: {task.technicianName}
        </div>
      )}
    </div>
  )
}

// -- Kanban Column Component --
function KanbanColumn({
  column,
  tasks,
  onStatusUpdate
}: {
  column: Column;
  tasks: MaintenanceRequest[];
  onStatusUpdate: (id: number, newStatus: string) => void;
}) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col flex-1 min-w-0 h-full rounded-xl bg-muted/40 border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-foreground capitalize">{column.title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        <SortableContext
          items={tasks.map((t) => t.requestId)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.requestId}
              task={task}
              onAction={onStatusUpdate}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// -- Main Page --
export default function MaintenancePage() {
  const [tasks, setTasks] = React.useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState<number | null>(null)
  const [activeTask, setActiveTask] = React.useState<MaintenanceRequest | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Load maintenance requests
  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Fetch requests for each column status in parallel
        const responses = await Promise.all(
          COLUMNS.map((col) =>
            listMaintenanceRequests({ status: col.status, limit: 50 })
          )
        )
        // Combine all requests
        const allTasks = responses.flatMap((r) => r.data.data as MaintenanceRequest[])
        setTasks(allTasks)
      } catch (err) {
        console.error("Failed to load maintenance requests:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Handle status update via drag-and-drop
  const handleStatusUpdate = async (requestId: number, newStatus: string) => {
    setUpdating(requestId)
    try {
      let result
      switch (newStatus) {
        case "Approved":
          result = await approveMaintenanceRequest(requestId)
          break
        case "TechnicianAssigned":
          // Requires technician name - for now, auto-assign or prompt
          // For drag-drop, we'll use a default name
          result = await assignTechnician(requestId, { technicianName: "Auto-assigned" })
          break
        case "InProgress":
          result = await updateProgress(requestId)
          break
        case "Resolved":
          result = await resolveMaintenanceRequest(requestId, { resolutionNotes: "Resolved via kanban" })
          break
        default:
          throw new Error("Invalid status transition")
      }

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.requestId === requestId ? result.data.request : t))
      )
    } catch (err) {
      console.error("Failed to update status:", err)
      // Revert the visual change
      setTasks((prev) => [...prev])
    } finally {
      setUpdating(null)
    }
  }

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.requestId === active.id)
    if (task) setActiveTask(task)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverTask = over.data.current?.type === "Task"
    const isOverColumn = over.data.current?.type === "Column"

    if (!isActiveTask) return

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.requestId === activeId)
        const overIndex = tasks.findIndex((t) => t.requestId === overId)
        const activeTask = tasks[activeIndex]
        const overTask = tasks[overIndex]

        // Find the column we're dropping into
        const targetColumn = COLUMNS.find((col) => col.status === overTask.status)
        if (!targetColumn) return tasks

        // Check if we need to update status
        if (activeTask.status !== overTask.status) {
          // Trigger API call for status update
          handleStatusUpdate(activeId, targetColumn.status)
          // Optimistically update UI
          const updated = { ...activeTask, status: targetColumn.status as any }
          const newTasks = [...tasks]
          newTasks[activeIndex] = updated
          return arrayMove(newTasks, activeIndex, overIndex - 1)
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    // Dropping a task over an empty column area
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.requestId === activeId)
        const activeTask = tasks[activeIndex]
        const targetColumn = COLUMNS.find((col) => col.id === overId)
        if (!targetColumn || activeTask.status === targetColumn.status) return tasks

        // Trigger API call for status update
        handleStatusUpdate(activeId, targetColumn.status)
        // Optimistically update UI
        activeTask.status = targetColumn.status as any
        return [...tasks]
      })
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-2rem)] overflow-hidden p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Maintenance</h2>
        </div>
        <MaintenanceRequestSheet onSuccess={() => window.location.reload()}>
          <Button className="bg-[#007a5a] hover:bg-[#007a5a]/90 text-white rounded-full px-6 shadow-none font-bold">
            <PlusIcon className="w-4 h-4 mr-2" /> Raise Request
          </Button>
        </MaintenanceRequestSheet>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex h-full gap-4 w-full">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.status)
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onStatusUpdate={handleStatusUpdate}
                />
              )
            })}
          </div>

          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </div>

      {/* Footer text */}
      <div className="mt-4 flex-shrink-0 text-center">
        <p className="text-sm text-muted-foreground italic">
          Drag cards to update status • Approving sets asset to Under Maintenance • Resolving returns it to Available
        </p>
      </div>
    </div>
  )
}
