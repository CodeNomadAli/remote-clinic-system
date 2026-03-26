"use client";

import { useState, useMemo } from "react";

import { Plus, Phone, Mail } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DoctorForm } from "@/components/forms/doctor-form";

import DynamicTable from "@/components/DynamicTable";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  consultationFee: number;
}

// 1️⃣ Dummy doctors data
const dummyDoctors: Doctor[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "0301-2345678",
    specialization: "Cardiologist",
    licenseNumber: "LIC12345",
    isActive: true,
    consultationFee: 50,
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "0302-9876543",
    specialization: "Dermatologist",
    licenseNumber: "LIC67890",
    isActive: false,
    consultationFee: 60,
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    phone: "0303-5555555",
    specialization: "Neurologist",
    licenseNumber: "LIC11223",
    isActive: true,
    consultationFee: 70,
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    phone: "0304-1112222",
    specialization: "Pediatrician",
    licenseNumber: "LIC44556",
    isActive: true,
    consultationFee: 55,
  },
  {
    id: "5",
    firstName: "William",
    lastName: "Johnson",
    email: "william.johnson@example.com",
    phone: "0305-3334445",
    specialization: "Orthopedic",
    licenseNumber: "LIC77889",
    isActive: false,
    consultationFee: 65,
  },
];

export default function DoctorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);

  // 2️⃣ Table columns
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Doctor",
      cell: ({ row }: any) => {
        const doctor: Doctor = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {doctor.firstName[0].toUpperCase()}{doctor.lastName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }: any) => {
        const doctor: Doctor = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" /> {doctor.phone}
            </div>
            {doctor.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" /> {doctor.email}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "licenseNumber",
      header: "License",
      cell: ({ row }: any) => row.original.licenseNumber,
    },
    {
      accessorKey: "consultationFee",
      header: "Fee",
      cell: ({ row }: any) => `$${row.original.consultationFee}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader title="Doctors" description="Manage doctors and their schedules">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editDoctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
              <DialogDescription>Enter the doctor information below</DialogDescription>
            </DialogHeader>
            <DoctorForm
              doctor={editDoctor || undefined}
              onSuccess={() => {
                setDialogOpen(false);
                setEditDoctor(null);
                // refresh data if using API
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
  );
}