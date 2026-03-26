"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { createAppointment, updateAppointment, usePatients, useDoctors } from "@/libs/hooks/use-api"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

const appointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.number().min(15),
  type: z.enum(["consultation", "follow_up", "procedure", "emergency", "routine_checkup"]),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

export function AppointmentForm({ appointment, onSuccess }: any) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { data: patientsData } = usePatients({ limit: 100 })
  const { data: doctorsData } = useDoctors()

  // ✅ Dummy fallback
  const patients =
    patientsData?.patients?.length
      ? patientsData.patients
      : [
          { id: "1", name: "Ali Khan" },
          { id: "2", name: "Ahmed Raza" },
        ]

  const doctors =
    doctorsData?.doctors?.length
      ? doctorsData.doctors
      : [
          { id: "1", name: "Usman", specialization: "Cardiologist" },
          { id: "2", name: "Sara", specialization: "Dermatologist" },
        ]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
      duration: 30,
      type: "consultation",
      notes: "",
    },
  })

  const onSubmit = async (data: AppointmentFormData) => {
    const dateTime = new Date(`${data.date}T${data.time}`).toISOString()

    const payload = {
      ...data,
      dateTime,
      notes: data.notes || null,
    }

    const res = appointment
      ? await updateAppointment(appointment.id, payload)
      : await createAppointment(payload)

    if (res.success) onSuccess()
  }

  return (
    <div className="relative">
      
      {/* ✅ Blur when dropdown open */}
      {dropdownOpen && (
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20 z-10 rounded-xl" />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-6 relative ${dropdownOpen ? "z-0" : "z-20"}`}
      >
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Patient */}
            <Field>
              <FieldLabel>Patient</FieldLabel>
              <Select
                onOpenChange={setDropdownOpen}
                value={watch("patientId")}
                onValueChange={(v) => setValue("patientId", v)}
              >
                <SelectTrigger className=" text-white border">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {patients.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Doctor */}
            <Field>
              <FieldLabel>Doctor</FieldLabel>
              <Select
                onOpenChange={setDropdownOpen}
                value={watch("doctorId")}
                onValueChange={(v) => setValue("doctorId", v)}
              >
                <SelectTrigger className=" text-white border">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {doctors.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      Dr. {d.name} - {d.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Date */}
            <Field>
              <FieldLabel>Date</FieldLabel>
              <Input
                type="date"
                {...register("date")}
                className=" text-white border"
              />
            </Field>

            {/* Time */}
            <Field>
              <FieldLabel>Time</FieldLabel>
              <Input
                type="time"
                {...register("time")}
                className=" text-white border"
              />
            </Field>

            {/* Duration */}
            <Field>
              <FieldLabel>Duration</FieldLabel>
              <Select
                onOpenChange={setDropdownOpen}
                value={watch("duration")?.toString()}
                onValueChange={(v) => setValue("duration", parseInt(v))}
              >
                <SelectTrigger className=" text-white border">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Type */}
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select
                onOpenChange={setDropdownOpen}
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as any)}
              >
                <SelectTrigger className=" text-white border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Notes */}
          <Field>
            <FieldLabel>Notes</FieldLabel>
            <Textarea
              {...register("notes")}
              className=" text-white border"
              placeholder="Write notes..."
            />
          </Field>
        </FieldGroup>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            Save Appointment
          </Button>
        </div>
      </form>
    </div>
  )
}