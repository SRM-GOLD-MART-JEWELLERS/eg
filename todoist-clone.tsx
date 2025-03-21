"use client"

import { useState } from "react"
import { Bell, Calendar, ChevronDown, MoreHorizontal, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function TodoistClone() {
  const [tasks, setTasks] = useState([{ id: 1, title: "example", completed: false, highlighted: false }])
  const [newTaskTitle, setNewTaskTitle] = useState("Go to the market Saturday morning")
  const [isAddingTask, setIsAddingTask] = useState(true)

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleHighlight = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, highlighted: !task.highlighted } : task)))
  }

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTaskTitle, completed: false, highlighted: false }])
      setNewTaskTitle("")
      setIsAddingTask(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar placeholder */}
      <div className="w-[138px] bg-[#FEFBF8] border-r border-gray-200">
        <div className="p-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300">
              <div className="h-4 w-4 border border-gray-500 rounded-sm"></div>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-gray-100 text-gray-700 gap-2 rounded-md">
              <Calendar className="h-4 w-4" />
              <span>Connect calendar</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <div className="flex flex-col items-center justify-center">
                <div className="w-5 h-[2px] bg-gray-500 mb-1"></div>
                <div className="w-5 h-[2px] bg-gray-500 mb-1"></div>
                <div className="w-5 h-[2px] bg-gray-500"></div>
              </div>
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Today</h1>
          <div className="flex items-center gap-2 text-gray-500 mb-8">
            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span>1 task</span>
          </div>

          {/* Task list */}
          <div className="mb-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center py-2 px-2 rounded-md group hover:bg-gray-50 relative",
                  task.highlighted && "bg-yellow-50",
                )}
              >
                <button
                  className="w-6 h-6 rounded-full border border-gray-300 mr-4 flex-shrink-0 flex items-center justify-center"
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  {task.completed && <span className="text-xs">✓</span>}
                </button>
                <span className={cn("text-gray-800 flex-grow", task.completed && "line-through text-gray-400")}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-yellow-500"
                    onClick={() => toggleHighlight(task.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill={task.highlighted ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={cn(task.highlighted ? "text-yellow-500" : "text-gray-400")}
                    >
                      <polygon
                        points="8,1.5 10,6 15,6.5 11.5,10 12.5,15 8,12.5 3.5,15 4.5,10 1,6.5 6,6"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => deleteTask(task.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-400 hover:text-red-500">
                      <path
                        d="M3,4 L13,4 L12,14 L4,14 L3,4 Z M6,2 L10,2 L10,4 L6,4 L6,2 Z"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="1.5"
                      />
                      <line x1="6" y1="7" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="10" y1="7" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add task form */}
          {isAddingTask && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="border-0 p-0 text-lg mb-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Task name"
              />
              <Textarea
                placeholder="Description"
                className="border-0 p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-500"
                rows={1}
              />

              <div className="flex items-center mt-4 mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-md border-gray-200 gap-1 text-green-600">
                    <Calendar className="h-4 w-4" />
                    <span>Today</span>
                    <X className="h-4 w-4 ml-1 text-gray-400" />
                  </Button>

                  <Button variant="outline" size="sm" className="h-8 rounded-md border-gray-200 gap-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
                      <path d="M8 4L4 8h8L8 4z" fill="currentColor" />
                    </svg>
                    <span>Priority</span>
                  </Button>

                  <Button variant="outline" size="sm" className="h-8 rounded-md border-gray-200 gap-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" strokeWidth="1.5" />
                      <path d="M8 5v3L10 10" stroke="currentColor" fill="none" strokeWidth="1.5" />
                    </svg>
                    <span>Reminders</span>
                  </Button>

                  <Button variant="outline" size="sm" className="h-8 w-8 rounded-md border-gray-200 relative">
                    <MoreHorizontal className="h-4 w-4" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="h-8 rounded-md border-gray-200 gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
                    <rect
                      x="3"
                      y="3"
                      width="10"
                      height="10"
                      rx="1"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span>Inbox</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 rounded-md border-gray-200"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 px-4 rounded-md bg-[#EC8A7C] hover:bg-[#e57c6d] text-white"
                    onClick={addTask}
                  >
                    Add task
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isAddingTask && (
            <Button variant="ghost" className="text-gray-500 pl-0" onClick={() => setIsAddingTask(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add task
            </Button>
          )}
        </main>
      </div>

      {/* Right sidebar placeholder - just to show "Inbox" text */}
      <div className="w-[200px] border-l border-gray-200 p-4">
        <div className="flex items-center justify-end gap-2 text-gray-700">
          <span>Inbox</span>
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
            <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" fill="none" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}

