"use client"

import { useState } from "react"

import { Plus, Eye, Edit, Trash2, Phone, Mail, Stethoscope } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { DoctorForm } from "@/components/forms/doctor-form"

import DynamicTable from "@/components/DynamicTable" // adjust path if needed

interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  licenseNumber: string
  status: string
  consultationFee: number
}

export default function DoctorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)

  const dummyDoctors: Doctor[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      specialization: "Cardiologist",
      licenseNumber: "LIC12345",
      status: "active",
      consultationFee: 50,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "987-654-3210",
      specialization: "Dermatologist",
      licenseNumber: "LIC67890",
      status: "inactive",
      consultationFee: 60,
    },
  ]

  const columns = [
    {
      header: "Doctor",
      accessorKey: "name",
      cell: (doctor: Doctor) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{doctor.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Dr. {doctor.name}</p>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: (doctor: Doctor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {doctor.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            {doctor.email}
          </div>
        </div>
      ),
    },
    {
      header: "License",
      accessorKey: "licenseNumber",
      cell: (doctor: Doctor) => <span className="font-mono text-sm">{doctor.licenseNumber}</span>,
    },
    {
      header: "Fee",
      accessorKey: "consultationFee",
      cell: (doctor: Doctor) => <span className="font-medium">${doctor.consultationFee}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (doctor: Doctor) => (
        <Badge variant={doctor.status === "active" ? "default" : "secondary"}>{doctor.status}</Badge>
      ),
    },
  ]

  
  return (
    <div className="space-y-6">
      <PageHeader title="Doctors" description="Manage doctors and their schedules">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>Enter the doctor information below</DialogDescription>
            </DialogHeader>
            <DoctorForm
              onSuccess={() => {
                setDialogOpen(false)

                // refresh data later
              }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

     

      <DynamicTable
      resource="users"
      permissionKey="user"
      data={dummyDoctors}
      columns={columns}
       pagination={{
          totalRecords: dummyDoctors.length,
          totalPages: 1,
          page: 1,
          pageSize: 10,
        }}
    />
    </div>
  )
}
