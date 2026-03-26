"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AppointmentForm } from "@/components/forms/appointment-form"

// Dummy data
const dummyAppointments = [
  {
    id: "1",
    patient: { id: "p1", name: "Ali Khan" },
    doctor: { id: "d1", name: "Sara Ahmed", specialization: "Dermatology" },
    dateTime: new Date().toISOString(),
    duration: 30,
    type: "Consultation",
    status: "scheduled",
    notes: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    patient: { id: "p2", name: "Fatima Noor" },
    doctor: { id: "d2", name: "Omar Farooq", specialization: "Cardiology" },
    dateTime: new Date().toISOString(),
    duration: 45,
    type: "Follow-up",
    status: "completed",
    notes: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    patient: { id: "p3", name: "Ahmed Raza" },
    doctor: { id: "d3", name: "Hina Malik", specialization: "Neurology" },
    dateTime: new Date().toISOString(),
    duration: 60,
    type: "Consultation",
    status: "cancelled",
    notes: null,
    createdAt: new Date().toISOString(),
  },
]

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "outline",
  in_progress: "default",
}

export default function AppointmentsPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("action") === "new")
  const [editAppointment, setEditAppointment] = useState(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // 🔹 Track if dropdown is open for blur effect
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Use dummy data
  const data = {
    data: dummyAppointments,
    totalPages: 1,
    stats: { total: 3, scheduled: 1, completed: 1, cancelled: 1 },
  }
  const isLoading = false

  const handleStatusChange = (id: string, status: string) => {
    console.log("Change status", id, status)
  }

  const handleDelete = () => {
    console.log("Delete appointment", deleteId)
    setDeleteId(null)
  }

  const columns = [
    {
      key: "patient",
      header: "Patient",
      cell: (apt) => (
        <div>
          <p className="font-medium">{apt.patient?.name || "Unknown"}</p>
          <p className="text-sm text-muted-foreground">{apt.type}</p>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (apt) => (
        <div>
          <p className="font-medium">Dr. {apt.doctor?.name || "Unknown"}</p>
          <p className="text-sm text-muted-foreground">{apt.doctor?.specialization}</p>
        </div>
      ),
    },
    {
      key: "dateTime",
      header: "Date & Time",
      cell: (apt) => (
        <div>
          <p className="font-medium">{format(new Date(apt.dateTime), "MMM d, yyyy")}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(apt.dateTime), "h:mm a")} ({apt.duration} min)
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (apt) => <Badge variant={statusColors[apt.status] || "secondary"}>{apt.status.replace("_", " ")}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (apt) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/appointments/${apt.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "completed")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "in_progress")}>
              <Clock className="mr-2 h-4 w-4 text-blue-600" /> Start Appointment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "no_show")}>
              <XCircle className="mr-2 h-4 w-4 text-orange-600" /> Mark No Show
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditAppointment(apt)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(apt.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Schedule and manage patient appointments">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </DialogTrigger>

          {dialogOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />}

          <DialogContent className="fixed left-1/2 top-[350px] z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl -translate-x-1/2 -translate-y-1/2">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
              <DialogDescription>Create a new appointment for a patient</DialogDescription>
            </DialogHeader>
            <AppointmentForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{data.stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{data.stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{data.stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{data.stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters with dropdown blur */}
      <div className="relative">
        {isDropdownOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"></div>}

        <div className="flex flex-wrap gap-4 relative z-40">
         <Select
  value={statusFilter}
  onValueChange={setStatusFilter}
>
  <SelectTrigger className="w-[180px] text-white">
    <SelectValue placeholder="All Status" className="text-white" />
  </SelectTrigger>

  {/* SelectContent with background blur */}
  <SelectContent className="relative text-white">
    {/* Blur background behind items */}
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-md z-0" />
    
    {/* Actual items */}
    <div className="relative z-10">
      <SelectItem value="all" className="text-white">All Status</SelectItem>
      <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
      <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
      <SelectItem value="completed" className="text-white">Completed</SelectItem>
      <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
      <SelectItem value="no_show" className="text-white">No Show</SelectItem>
    </div>
  </SelectContent>
</Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[180px] text-white"
          />

          {(statusFilter || dateFilter) && (
            <Button
              variant="ghost"
              onClick={() => {
                setStatusFilter("")
                setDateFilter("")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data.data}
        isLoading={isLoading}
        pagination={{ page, totalPages: data.totalPages, onPageChange: setPage }}
        emptyMessage="No appointments found"
      />
    </div>
  )
}