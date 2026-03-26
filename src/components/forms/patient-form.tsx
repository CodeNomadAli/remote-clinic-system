"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import type { z } from "zod"

import { createPatientSchema } from "@/libs/validations";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { createPatient, updatePatient } from "@/libs/hooks/use-api"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

// Maps for Prisma enums
const GENDER_MAP: Record<string, "MALE" | "FEMALE" | "OTHER"> = {
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
}

const BLOOD_GROUP_MAP: Record<string, "A_POS" | "A_NEG" | "B_POS" | "B_NEG" | "AB_POS" | "AB_NEG" | "O_POS" | "O_NEG"> = {
  "A+": "A_POS",
  "A-": "A_NEG",
  "B+": "B_POS",
  "B-": "B_NEG",
  "AB+": "AB_POS",
  "AB-": "AB_NEG",
  "O+": "O_POS",
  "O-": "O_NEG",
}

type PatientFormData = z.infer<typeof createPatientSchema> & {
  appointments?: any[]
  emrRecords?: any[]
  labTests?: any[]
  billings?: any[]
  prescriptions?: any[]
}

interface PatientFormProps {
  patient?: Partial<PatientFormData> & { id: string }
  onSuccess: () => void
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const isEditing = !!patient

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<PatientFormData>({
      resolver: zodResolver(createPatientSchema),
      defaultValues: {
        firstName: patient?.firstName || "",
        lastName: patient?.lastName || "",
        email: patient?.email || "",
        phone: patient?.phone || "",
        dateOfBirth: patient?.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: patient?.gender || "MALE",
        bloodGroup: patient?.bloodGroup || undefined,
        address: patient?.address || null,
        city: patient?.city || "",
        cnic: patient?.cnic || null,
        alternatePhone: patient?.alternatePhone || null,
        photo: patient?.photo || null,
        allergies: patient?.allergies || null,
        emergencyName: patient?.emergencyName || null,
        emergencyPhone: patient?.emergencyPhone || null,
        emergencyRelation: patient?.emergencyRelation || null,
        notes: patient?.notes || null,
        appointments: patient?.appointments || [],
        emrRecords: patient?.emrRecords || [],
        labTests: patient?.labTests || [],
        billings: patient?.billings || [],
        prescriptions: patient?.prescriptions || [],
      },
    })

  const onSubmit = async (data: PatientFormData) => {
    // alert(data.bloodGroup)
    console.log(data.bloodGroup,"sdf")

    const payload = {
      ...data,
      gender: GENDER_MAP[data.gender.toLowerCase()] as "MALE" | "FEMALE" | "OTHER",
      bloodGroup: data.bloodGroup,
      address: data.address || null,
      cnic: data.cnic || null,
      alternatePhone: data.alternatePhone || null,
      photo: data.photo || null,
      allergies: data.allergies || null,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      notes: data.notes || null,
      appointments: data.appointments?.length ? { create: data.appointments } : { create: [] },
      emrRecords: data.emrRecords?.length ? { create: data.emrRecords } : { create: [] },
      labTests: data.labTests?.length ? { create: data.labTests } : { create: [] },
      billings: data.billings?.length ? { create: data.billings } : { create: [] },
      prescriptions: data.prescriptions?.length ? { create: data.prescriptions } : { create: [] },
    }

    console.log(payload, "hhelo")

    const result = isEditing
      ? await updatePatient(patient.id, payload)
      : await createPatient(payload)

    if (result.success) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
            <Input id="firstName" {...register("firstName")} aria-invalid={!!errors.firstName} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
            <Input id="lastName" {...register("lastName")} aria-invalid={!!errors.lastName} />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
            <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="dateOfBirth">Date of Birth *</FieldLabel>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="gender">Gender *</FieldLabel>
            <Select
              value={watch("gender")}
              onValueChange={(value) => setValue("gender", value as "MALE" | "FEMALE" | "OTHER")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="bloodGroup">Blood Group</FieldLabel>
            <Select
              value={watch("bloodGroup") || ""}
              onValueChange={(value) => setValue("bloodGroup", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A_POS">A+</SelectItem>
                <SelectItem value="A_NEG">A-</SelectItem>
                <SelectItem value="B_POS">B+</SelectItem>
                <SelectItem value="B_NEG">B-</SelectItem>
                <SelectItem value="AB_POS">AB+</SelectItem>
                <SelectItem value="AB_NEG">AB-</SelectItem>
                <SelectItem value="O_POS">O+</SelectItem>
                <SelectItem value="O_NEG">O-</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Textarea id="address" {...register("address")} rows={2} />
        </Field>

        <Field>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <Input id="city" {...register("city")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="emergencyName">Emergency Contact Name</FieldLabel>
            <Input id="emergencyName" {...register("emergencyName")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="emergencyPhone">Emergency Contact Phone</FieldLabel>
            <Input id="emergencyPhone" {...register("emergencyPhone")} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="emergencyRelation">Emergency Relation</FieldLabel>
          <Input id="emergencyRelation" {...register("emergencyRelation")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="cnic">CNIC</FieldLabel>
          <Input id="cnic" {...register("cnic")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="alternatePhone">Alternate Phone</FieldLabel>
          <Input id="alternatePhone" {...register("alternatePhone")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="photo">Photo URL</FieldLabel>
          <Input id="photo" {...register("photo")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="allergies">Allergies</FieldLabel>
          <Textarea id="allergies" {...register("allergies")} rows={2} />
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" {...register("notes")} rows={2} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Update Patient" : "Create Patient"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
