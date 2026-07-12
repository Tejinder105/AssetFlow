"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
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

// -- Types & Mock Data --
type Task = {
  id: string
  asset: string
  title: string
  detail?: string
  columnId: string
}

type Column = {
  id: string
  title: string
}

const COLUMNS: Column[] = [
  { id: "pending", title: "Pending" },
  { id: "approved", title: "Approved" },
  { id: "assigned", title: "Technician assigned" },
  { id: "progress", title: "in progress" },
  { id: "resolved", title: "Resolved" },
]

const INITIAL_TASKS: Task[] = [
  { id: "t1", asset: "AF-0062", title: "Projector bulb not turning on", columnId: "pending" },
  { id: "t2", asset: "AF-003", title: "ac unit noisy compresor", columnId: "approved" },
  { id: "t3", asset: "AF-0078", title: "forklift", detail: "tech: R varma", columnId: "assigned" },
  { id: "t4", asset: "AF-897", title: "Printer Jam", detail: "parts ordered", columnId: "progress" },
  { id: "t5", asset: "AF-873", title: "Chair repair", detail: "resolved 7 Jul", columnId: "resolved" },
]

// -- Sortable Item Component --
function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isResolved = task.columnId === "resolved"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-4 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing text-left mb-3
        ${isDragging ? 'opacity-50 border-primary' : 'opacity-100'}
        ${isResolved ? 'bg-[#d1f4e0] border-[#007a5a]/20 text-[#007a5a]' : 'bg-background border-border hover:border-muted-foreground/30'}
      `}
    >
      <div className={`font-semibold text-sm ${isResolved ? 'text-[#007a5a]' : 'text-foreground'}`}>
        {task.asset}
      </div>
      <div className={`text-sm mt-1 leading-snug ${isResolved ? 'text-[#007a5a]/90' : 'text-muted-foreground'}`}>
        {task.title}
      </div>
      {task.detail && (
        <div className={`text-sm mt-1 leading-snug ${isResolved ? 'text-[#007a5a]/90' : 'text-muted-foreground'}`}>
          {task.detail}
        </div>
      )}
    </div>
  )
}

// -- Static Card for Drag Overlay --
function TaskCard({ task }: { task: Task }) {
  const isResolved = task.columnId === "resolved"
  return (
    <div
      className={`
        p-4 rounded-lg border shadow-lg text-left
        ${isResolved ? 'bg-[#d1f4e0] border-[#007a5a]/20 text-[#007a5a]' : 'bg-background border-border'}
      `}
    >
      <div className={`font-semibold text-sm ${isResolved ? 'text-[#007a5a]' : 'text-foreground'}`}>
        {task.asset}
      </div>
      <div className={`text-sm mt-1 leading-snug ${isResolved ? 'text-[#007a5a]/90' : 'text-muted-foreground'}`}>
        {task.title}
      </div>
      {task.detail && (
        <div className={`text-sm mt-1 leading-snug ${isResolved ? 'text-[#007a5a]/90' : 'text-muted-foreground'}`}>
          {task.detail}
        </div>
      )}
    </div>
  )
}

// -- Main Page --
export default function MaintenancePage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS)
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
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
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const overIndex = tasks.findIndex((t) => t.id === overId)
        const activeTask = tasks[activeIndex]
        const overTask = tasks[overIndex]

        if (activeTask.columnId !== overTask.columnId) {
          activeTask.columnId = overTask.columnId
          return arrayMove(tasks, activeIndex, overIndex - 1)
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    // Dropping a task over an empty column area
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId)
        const activeTask = tasks[activeIndex]
        activeTask.columnId = overId as string
        return arrayMove(tasks, activeIndex, activeIndex) // just trigger re-render
      })
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const overIndex = tasks.findIndex((t) => t.id === overId)
      
      // If over a task, standard arrayMove
      if (over.data.current?.type === "Task") {
        return arrayMove(tasks, activeIndex, overIndex)
      }
      return tasks
    })
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-2rem)] overflow-hidden p-4 md:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Maintenance</h2>
        </div>
        <MaintenanceRequestSheet>
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
              const columnTasks = tasks.filter((task) => task.columnId === column.id)
              
            
              const { setNodeRef } = useSortable({
                id: column.id,
                data: { type: "Column", column },
              })

              return (
                <div 
                  key={column.id} 
                  ref={setNodeRef}
                  className="flex flex-col flex-1 min-w-0 h-full rounded-xl bg-muted/40 border border-border overflow-hidden"
                >
                  <div className="p-4 border-b border-border bg-muted/20">
                    <h3 className="font-semibold text-sm text-foreground capitalize">
                      {column.title}
                    </h3>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto">
                    <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      {columnTasks.map((task) => (
                        <SortableTaskCard key={task.id} task={task} />
                      ))}
                    </SortableContext>
                  </div>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer text */}
      <div className="mt-4 flex-shrink-0 text-center">
        <p className="text-sm text-muted-foreground italic">
          Approving a card moves the asset to under maintenance, resolving returns it to available
        </p>
      </div>
    </div>
  )
}
