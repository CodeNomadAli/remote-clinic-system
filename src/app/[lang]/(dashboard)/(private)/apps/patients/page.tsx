"use client";

import { useState, useCallback, useContext, useMemo } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { format } from "date-fns";

import { Button, Badge, Box } from "@mui/material";

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
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(row.dateOfBirth), "MMM d, yyyy")} - {row.gender}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: (row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">{row.phone}</div>
          {row.email && <div className="text-sm text-muted-foreground">{row.email}</div>}
        </div>
      ),
    },
    {
      accessorKey: "bloodGroup",
      header: "Blood Group",
      cell: (row: any) => <Badge variant="outlined">{row.bloodGroup || "N/A"}</Badge>,
    },
    
    {
      accessorKey: "status",
      header: "Status",
      cell: (row: any) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "registered",
      header: "Registered",
      cell: (row: any) => format(new Date(row.createdAt), "MMM d, yyyy"),
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Manage patient records and information">
        <Button onClick={() => setDialogOpen(true)}>Add Patient</Button>
        
      </PageHeader>

      <DynamicTable
        resource="patients"
        permissionKey="patients"
        data={data?.data || []}
        columns={columns}
        pagination={{
          totalRecords: data?.totalRecords || 0,
          totalPages: data?.totalPages || 1,
          page,
          pageSize,
        }}
      />

      {/* Add/Edit Dialog */}
      {dialogOpen || editPatient ? (
        <PatientForm
          patient={editPatient || undefined}
          onSuccess={() => {
            setDialogOpen(false);
            setEditPatient(null);
            mutate();
          }}
        />
      ) : null}

      {/* Delete Confirmation */}
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
