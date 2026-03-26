"use client";

import { useState, useCallback, useContext, useMemo } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { format } from "date-fns";

import { Button, Badge, Box, Dialog, DialogContent, IconButton } from "@mui/material";

import { X } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";

import DynamicTable from "@/components/DynamicTable";
import { PatientForm } from "@/components/forms/patient-form";
import { usePatients, deletePatient } from "@/libs/hooks/use-api";
import { useDebouncedCallback } from "@/libs/hooks/use-debounce";
import { SettingsContext } from "@core/contexts/settingsContext";
import { showLoading, hideLoading, showSuccess, showError } from "@/utils/frontend-helper";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string | null;
  isActive: boolean;
  createdAt: string;
}

// 1️⃣ Keep dummyPatients outside the component
const dummyPatients: Patient[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 555-123-4567",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    bloodGroup: "A+",
    isActive: true,
    createdAt: "2023-01-10T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 555-987-6543",
    dateOfBirth: "1990-09-22",
    gender: "Female",
    bloodGroup: "B-",
    isActive: false,
    createdAt: "2023-03-05T15:45:00Z",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    email: null,
    phone: "+1 555-555-5555",
    dateOfBirth: "1978-12-01",
    gender: "Male",
    bloodGroup: "O+",
    isActive: true,
    createdAt: "2022-11-20T08:15:00Z",
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    phone: "+1 555-111-2222",
    dateOfBirth: "1995-02-18",
    gender: "Female",
    bloodGroup: "AB+",
    isActive: true,
    createdAt: "2023-02-28T12:00:00Z",
  },
];

export default function PatientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("action") === "new");
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { permissions = [] } = useContext(SettingsContext)!.settings;

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const { data, isLoading, mutate } = usePatients({ search, page, limit: pageSize });

  const canDoAction = useCallback(
    (key: string) => permissions.includes(key),
    [permissions]
  );

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      showLoading();
      const result = await deletePatient(id);

      if (result.success) {
        showSuccess("Patient deleted successfully");
        mutate();
      } else {
        showError("Failed to delete patient");
      }
    } catch (err) {
      showError("Error deleting patient");
    } finally {
      hideLoading();
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Patient",
      cell: ({ row }: any) => {
        const patient = row.original; // ✅ get the actual data


        return (
          <div>
            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM d, yyyy") : "N/A"} - {patient.gender || "N/A"}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }: any) => {
        const patient = row.original;


        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">{patient.phone || "N/A"}</div>
            {patient.email && <div className="text-sm text-muted-foreground">{patient.email}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "bloodGroup",
      header: "Blood Group",
      cell: ({ row }: any) => <Badge variant="outlined">{row.original.bloodGroup || "N/A"}</Badge>,
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
    {
      accessorKey: "registered",
      header: "Registered",
      cell: ({ row }: any) => row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "N/A",
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Manage patient records and information">
        <Button onClick={() => setDialogOpen(true)}>Add Patient</Button>
      </PageHeader>

      <DynamicTable
        resource="users"
        permissionKey="user"
        data={data?.data && data.data.length > 0 ? data.data : dummyPatients}
        columns={columns}
        pagination={{
          totalRecords: data?.totalRecords || dummyPatients.length,
          totalPages: data?.totalPages || 1,
          page,
          pageSize,
        }}
      />

      <Dialog
        open={dialogOpen || !!editPatient}
        onClose={() => {
          setDialogOpen(false);
          setEditPatient(null);
        }}
        maxWidth="md"
        fullWidth
        BackdropProps={{
          style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.2)" },
        }}
      >
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">{editPatient ? "Edit Patient" : "Add Patient"}</h2>
          <IconButton onClick={() => { setDialogOpen(false); setEditPatient(null); }} size="small">
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        <DialogContent>
          <PatientForm
            patient={editPatient || undefined}
            onSuccess={() => {
              setDialogOpen(false);
              setEditPatient(null);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      {deleteId && (
        <Box>
          <p>Are you sure you want to delete this patient?</p>
          <Button onClick={() => handleDelete(deleteId)}>Delete</Button>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
        </Box>
      )}
    </div>
  );
}
