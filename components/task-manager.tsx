"use client"

import { useState, useEffect, useRef } from "react"
import {
  Bell,
  Calendar,
  ChevronDown,
  Plus,
  X,
  Star,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"

// Types
type Priority = "low" | "medium" | "high" | null
type Reminder = { time: number; label: string } | null

interface Task {
  id: number
  title: string
  completed: false
  highlighted: boolean
  priority: Priority
  reminder: Reminder
  dueDate: string
  description: string
}

interface CalendarEvent {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  color: string
}

// Helper functions
const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "high":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0]
}

export default function TaskManager() {
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // State
  const [activeTab, setActiveTab] = useState("today")
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "example",
      completed: false,
      highlighted: false,
      priority: null,
      reminder: null,
      dueDate: new Date().toISOString().split("T")[0],
      description: "",
    },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState("Go to the market Saturday morning")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(null)
  const [newTaskReminder, setNewTaskReminder] = useState<Reminder>(null)
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split("T")[0])
  const [isAddingTask, setIsAddingTask] = useState(true)
  const [notifications, setNotifications] = useState<{ id: number; message: string; read: boolean }[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [customReminderMinutes, setCustomReminderMinutes] = useState("30")
  const [showCustomReminder, setShowCustomReminder] = useState(false)

  // Calendar states
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month")
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: formatDate(new Date()),
    startTime: "09:00",
    endTime: "10:00",
    color: "#4f46e5",
  })

  // Effects
  useEffect(() => {
    // Load tasks from localStorage when component mounts
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error("Error parsing saved tasks:", error)
      }
    }
  }, [])

  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error("Error parsing saved notifications:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Load calendar events
    const savedEvents = localStorage.getItem("calendarEvents")
    if (savedEvents) {
      try {
        setCalendarEvents(JSON.parse(savedEvents))
      } catch (error) {
        console.error("Error parsing saved events:", error)
      }
    } else {
      // Add some sample events if there are none
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)

      const sampleEvents: CalendarEvent[] = [
        {
          id: Date.now(),
          title: "Team Meeting",
          date: formatDate(today),
          startTime: "10:00",
          endTime: "11:00",
          color: "#4f46e5",
        },
        {
          id: Date.now() + 1,
          title: "Project Review",
          date: formatDate(tomorrow),
          startTime: "14:00",
          endTime: "15:30",
          color: "#10b981",
        },
      ]

      setCalendarEvents(sampleEvents)
    }
  }, [])

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  // Also save notifications to localStorage
  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  // Save calendar events to localStorage
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents))
  }, [calendarEvents])

  useEffect(() => {
    // Check for tasks with reminders
    const interval = setInterval(() => {
      const now = new Date()
      tasks.forEach((task) => {
        if (task.reminder && !task.completed) {
          const reminderTime = task.reminder.time
          const taskCreationTime = task.id // Using id as timestamp
          const elapsedMinutes = (now.getTime() - taskCreationTime) / (1000 * 60)

          if (elapsedMinutes >= reminderTime) {
            // Create notification
            const newNotification = {
              id: Date.now(),
              message: `Reminder: "${task.title}" is due soon!`,
              read: false,
            }

            // Add to notifications if not already there
            if (!notifications.some((n) => n.message === newNotification.message)) {
              setNotifications((prev) => [newNotification, ...prev])

              // Show browser notification
              if (Notification.permission === "granted") {
                new Notification("Task Reminder", {
                  body: newNotification.message,
                  icon: "/favicon.ico",
                })
              }

              // Show toast
              toast({
                title: "Task Reminder",
                description: newNotification.message,
              })
            }
          }
        }
      })
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [tasks, notifications])

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobile, sidebarRef])

  // Task functions
  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const completed = !task.completed

          // Create notification for completed task
          if (completed) {
            const newNotification = {
              id: Date.now(),
              message: `Task completed: "${task.title}"`,
              read: false,
            }
            setNotifications((prev) => [newNotification, ...prev])
          }

          return { ...task, completed }
        }
        return task
      }),
    )
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleHighlight = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, highlighted: !task.highlighted } : task)))
  }

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle,
        completed: false,
        highlighted: false,
        priority: newTaskPriority,
        reminder: newTaskReminder,
        dueDate: newTaskDueDate,
        description: newTaskDescription,
      }

      setTasks([...tasks, newTask])

      // Reset form
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskPriority(null)
      setNewTaskReminder(null)
      setNewTaskDueDate(new Date().toISOString().split("T")[0])
      setIsAddingTask(false)

      // Create notification for new task
      const newNotification = {
        id: Date.now(),
        message: `New task added: "${newTaskTitle}"`,
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev])

      // Show toast
      toast({
        title: "Task Added",
        description: `"${newTaskTitle}" has been added to your tasks.`,
      })
    }
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const setTaskPriority = (id: number, priority: Priority) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, priority } : task)))
  }

  const setTaskReminder = (id: number, reminder: Reminder) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, reminder } : task)))

    // Create notification for reminder set
    const task = tasks.find((t) => t.id === id)
    if (task && reminder) {
      const newNotification = {
        id: Date.now(),
        message: `Reminder set for "${task.title}" in ${reminder.label}`,
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev])

      // Show toast
      toast({
        title: "Reminder Set",
        description: `You'll be reminded about "${task.title}" in ${reminder.label}.`,
      })
    }
  }

  const applyCustomReminder = (id: number) => {
    const minutes = Number.parseInt(customReminderMinutes)
    if (!isNaN(minutes) && minutes > 0) {
      const reminder = {
        time: minutes,
        label: `${minutes} minutes`,
      }
      setTaskReminder(id, reminder)
      setShowCustomReminder(false)
    }
  }

  // Calendar functions
  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event: CalendarEvent = {
        id: Date.now(),
        title: newEvent.title as string,
        date: newEvent.date as string,
        startTime: newEvent.startTime as string,
        endTime: newEvent.endTime as string,
        color: newEvent.color as string,
      }

      setCalendarEvents([...calendarEvents, event])
      setShowAddEventModal(false)

      // Reset form
      setNewEvent({
        title: "",
        date: formatDate(new Date()),
        startTime: "09:00",
        endTime: "10:00",
        color: "#4f46e5",
      })

      toast({
        title: "Event Added",
        description: `"${event.title}" has been added to your calendar.`,
      })
    }
  }

  const deleteEvent = (id: number) => {
    setCalendarEvents(calendarEvents.filter((event) => event.id !== id))
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your calendar.",
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)

    // If in month view, switch to day view when clicking a date
    if (calendarView === "month") {
      setCalendarView("day")
    }
  }

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "today") {
      const today = new Date().toISOString().split("T")[0]
      return task.dueDate === today || task.dueDate === ""
    } else if (activeTab === "completed") {
      return task.completed
    } else if (activeTab === "highlighted") {
      return task.highlighted
    } else if (activeTab === "calendar") {
      return task.dueDate === selectedDate
    }
    return true
  })

  // Get events for selected date
  const eventsForSelectedDate = calendarEvents.filter((event) => event.date === selectedDate)

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  // Calendar rendering helpers
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 border border-gray-100"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isToday = date === new Date().toISOString().split("T")[0]
      const isSelected = date === selectedDate

      // Check if there are events on this day
      const hasEvents = calendarEvents.some((event) => event.date === date)

      // Check if there are tasks due on this day
      const hasTasks = tasks.some((task) => task.dueDate === date)

      days.push(
        <div
          key={day}
          className={cn(
            "h-10 border border-gray-100 flex flex-col items-center justify-start p-1 cursor-pointer hover:bg-gray-50 relative",
            isToday && "bg-blue-50",
            isSelected && "border-blue-500 border-2",
          )}
          onClick={() => handleDateClick(date)}
        >
          <span className={cn("text-sm", isToday && "font-bold text-blue-600")}>{day}</span>
          {hasEvents && <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-blue-500"></div>}
          {hasTasks && <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-red-500"></div>}
        </div>,
      )
    }

    return days
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Mobile sidebar toggle */}
      {isMobile && !sidebarOpen && (
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Left sidebar */}
      {(sidebarOpen || !isMobile) && (
        <div
          ref={sidebarRef}
          className={cn(
            "bg-[#FEFBF8] border-r border-gray-200 flex flex-col z-40",
            isMobile ? "fixed inset-y-0 left-0 w-[80%] max-w-[280px] shadow-lg transition-transform" : "w-[220px]",
          )}
        >
          <div className="p-4 flex items-center justify-between">
            <h2 className="font-bold text-lg">Task Manager</h2>
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="fixed top-[60px] right-4 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[80vh] overflow-hidden">
                    <div className="p-2 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs h-7">
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <div className="max-h-[calc(80vh-48px)] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-3 border-b border-gray-100 flex items-start",
                              !notification.read && "bg-blue-50",
                            )}
                          >
                            <div className="flex-grow">
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.id).toLocaleTimeString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4">
            <ul>
              <li>
                <Button
                  variant={activeTab === "today" ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none px-4 py-2 font-normal"
                  onClick={() => handleTabChange("today")}
                >
                  Today
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "completed" ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none px-4 py-2 font-normal"
                  onClick={() => handleTabChange("completed")}
                >
                  Completed
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "highlighted" ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none px-4 py-2 font-normal"
                  onClick={() => handleTabChange("highlighted")}
                >
                  Highlighted
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === "calendar" ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none px-4 py-2 font-normal"
                  onClick={() => handleTabChange("calendar")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </li>
            </ul>
          </nav>

          <div className="mt-auto p-4 text-sm text-gray-500">
            <p>Task Manager v1.0</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            {isMobile && !sidebarOpen && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">
              {activeTab === "today" && "Today"}
              {activeTab === "completed" && "Completed Tasks"}
              {activeTab === "highlighted" && "Highlighted Tasks"}
              {activeTab === "calendar" && "Calendar"}
            </h1>
          </div>
          {activeTab === "calendar" && (
            <Button size="sm" onClick={() => setShowAddEventModal(true)} className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab !== "calendar" ? (
            <>
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Task list */}
              <div className="mb-4 space-y-1">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center py-3 px-3 rounded-md group hover:bg-gray-50 relative",
                      task.highlighted && "bg-yellow-50",
                    )}
                  >
                    <button
                      className="w-6 h-6 rounded-full border border-gray-300 mr-4 flex-shrink-0 flex items-center justify-center"
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      {task.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </button>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className={cn("text-gray-800 truncate", task.completed && "line-through text-gray-400")}>
                          {task.title}
                        </span>

                        {task.priority && (
                          <Badge className={cn("ml-1", getPriorityColor(task.priority))}>{task.priority}</Badge>
                        )}

                        {task.reminder && (
                          <Badge className="ml-1 bg-purple-100 text-purple-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.reminder.label}
                          </Badge>
                        )}

                        {task.dueDate && task.dueDate !== new Date().toISOString().split("T")[0] && (
                          <Badge className="ml-1 bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      {task.description && <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Priority dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
                              <path d="M8 4L4 8h8L8 4z" fill="currentColor" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTaskPriority(task.id, "low")}>
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                            Low Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskPriority(task.id, "medium")}>
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                            Medium Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskPriority(task.id, "high")}>
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                            High Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskPriority(task.id, null)}>
                            Clear Priority
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Reminder dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTaskReminder(task.id, { time: 1, label: "1 minute" })}>
                            In 1 minute
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskReminder(task.id, { time: 5, label: "5 minutes" })}>
                            In 5 minutes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskReminder(task.id, { time: 10, label: "10 minutes" })}>
                            In 10 minutes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskReminder(task.id, { time: 20, label: "20 minutes" })}>
                            In 20 minutes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setShowCustomReminder(true)
                            }}
                          >
                            Custom...
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTaskReminder(task.id, null)}>
                            Clear Reminder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Custom reminder dialog */}
                      {showCustomReminder && (
                        <Dialog open={showCustomReminder} onOpenChange={setShowCustomReminder}>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Set Custom Reminder</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="flex items-center gap-4">
                                <Input
                                  type="number"
                                  value={customReminderMinutes}
                                  onChange={(e) => setCustomReminderMinutes(e.target.value)}
                                  min="1"
                                  className="w-20"
                                />
                                <span>minutes</span>
                              </div>
                              <Button onClick={() => applyCustomReminder(task.id)}>Set Reminder</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Highlight button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-yellow-500"
                        onClick={() => toggleHighlight(task.id)}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            task.highlighted ? "fill-yellow-500 text-yellow-500" : "text-gray-400",
                          )}
                        />
                      </Button>

                      {/* Delete button */}
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
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="border-0 p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-500"
                    rows={2}
                  />

                  <div className="flex items-center mt-4 mb-4 flex-wrap gap-2">
                    {/* Date picker */}
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="h-8 w-auto"
                    />

                    {/* Priority selector */}
                    <Select onValueChange={(value: Priority) => setNewTaskPriority(value as Priority)}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Reminder selector */}
                    <Select
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setShowCustomReminder(true)
                        } else if (value === "1") {
                          setNewTaskReminder({ time: 1, label: "1 minute" })
                        } else if (value === "5") {
                          setNewTaskReminder({ time: 5, label: "5 minutes" })
                        } else if (value === "10") {
                          setNewTaskReminder({ time: 10, label: "10 minutes" })
                        } else if (value === "20") {
                          setNewTaskReminder({ time: 20, label: "20 minutes" })
                        }
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Reminder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">In 1 minute</SelectItem>
                        <SelectItem value="5">In 5 minutes</SelectItem>
                        <SelectItem value="10">In 10 minutes</SelectItem>
                        <SelectItem value="20">In 20 minutes</SelectItem>
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
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
            </>
          ) : (
            /* Calendar View */
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-medium">
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs
                    value={calendarView}
                    onValueChange={(value) => setCalendarView(value as any)}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="w-full grid grid-cols-3 sm:w-auto">
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="day">Day</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button size="sm" onClick={() => setShowAddEventModal(true)} className="sm:hidden w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              {calendarView === "month" && (
                <div className="overflow-x-auto">
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 gap-1 mb-1 min-w-[500px]">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center font-medium text-sm py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1 min-w-[500px]">{renderCalendarDays()}</div>
                </div>
              )}

              {/* Day View */}
              {calendarView === "day" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {new Date(selectedDate).toLocaleDateString("default", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>

                  {/* Events for the day */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Events</h4>
                      <Button size="sm" variant="outline" onClick={() => setShowAddEventModal(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Event
                      </Button>
                    </div>
                    {eventsForSelectedDate.length === 0 ? (
                      <p className="text-gray-500">No events scheduled for this day</p>
                    ) : (
                      eventsForSelectedDate.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-md border border-gray-200 flex items-center"
                          style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
                        >
                          <div className="flex-grow">
                            <h5 className="font-medium">{event.title}</h5>
                            <p className="text-sm text-gray-500">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tasks for the day */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Tasks</h4>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingTask(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    </div>
                    {filteredTasks.length === 0 ? (
                      <p className="text-gray-500">No tasks due for this day</p>
                    ) : (
                      <div className="space-y-1">
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center p-2 rounded-md",
                              task.highlighted && "bg-yellow-50",
                              task.completed && "opacity-60",
                            )}
                          >
                            <button
                              className="w-5 h-5 rounded-full border border-gray-300 mr-3 flex-shrink-0 flex items-center justify-center"
                              onClick={() => toggleTaskCompletion(task.id)}
                            >
                              {task.completed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                            </button>
                            <span className={cn("text-gray-800", task.completed && "line-through text-gray-400")}>
                              {task.title}
                            </span>
                            {task.priority && (
                              <Badge className={cn("ml-2", getPriorityColor(task.priority))}>{task.priority}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Week View */}
              {calendarView === "week" && (
                <div className="space-y-4 overflow-x-auto">
                  <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                    {Array.from({ length: 7 }).map((_, index) => {
                      const date = new Date(currentDate)
                      const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()))
                      const day = new Date(firstDayOfWeek)
                      day.setDate(firstDayOfWeek.getDate() + index)

                      const formattedDate = formatDate(day)
                      const isToday = formattedDate === new Date().toISOString().split("T")[0]
                      const isSelected = formattedDate === selectedDate

                      // Get events for this day
                      const dayEvents = calendarEvents.filter((event) => event.date === formattedDate)

                      return (
                        <div
                          key={index}
                          className={cn(
                            "border rounded-md p-2 min-h-[150px] cursor-pointer",
                            isToday && "bg-blue-50",
                            isSelected && "border-blue-500 border-2",
                          )}
                          onClick={() => handleDateClick(formattedDate)}
                        >
                          <div className="text-center mb-2">
                            <div className="text-xs text-gray-500">
                              {day.toLocaleDateString("default", { weekday: "short" })}
                            </div>
                            <div className={cn("text-lg", isToday && "font-bold text-blue-600")}>{day.getDate()}</div>
                          </div>

                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 mb-1 rounded truncate"
                              style={{ backgroundColor: `${event.color}20`, color: event.color }}
                            >
                              {event.startTime} {event.title}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Event Modal */}
      <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event in your calendar.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="event-title" className="text-sm font-medium">
                Event Title
              </label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Meeting with team"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="event-date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="start-time" className="text-sm font-medium">
                  Start Time
                </label>
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="end-time" className="text-sm font-medium">
                  End Time
                </label>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="event-color" className="text-sm font-medium">
                Color
              </label>
              <div className="flex gap-2">
                {["#4f46e5", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"].map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2",
                      newEvent.color === color ? "border-black" : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  />
                ))}
              </div>
            </div>

            <Button onClick={addEvent} className="mt-2">
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

