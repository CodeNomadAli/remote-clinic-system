import { BloodGroup } from "@prisma/client";

import prisma from '@/db'
  import {  logActivity } from "@/libs/auth/auth";
  import {
    validateRequest,
    successResponse,
    errorResponse,
    paginatedResponse,
    getPaginationParams,
    generatePatientNumber,
  } from "@/libs/api/utils";
  import { createPatientSchema } from "@/libs/validations";
import { getAuthUser } from '@/utils/backend-helper';



  // GET /api/patients - List all patients
  // GET /api/patients - List patients for authenticated user
export async function GET(request: Request) {
  try {
    // Get authenticated user
    const user = await getAuthUser();

    if (!user?.id) return errorResponse("Unauthorized", 401);

    // Pagination and query params
    const { page, limit, sortBy, sortOrder, search } = getPaginationParams(request);
    const skip = (page - 1) * limit;

    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const bloodGroup = searchParams.get("bloodGroup");
    const isActive = searchParams.get("isActive");

    // Build where clause
    const where: Record<string, any> = { userId: user.id }; // <-- filter by authenticated user

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
        { patientNumber: { contains: search } },
        { cnic: { contains: search } },
      ];
    }

    if (gender) where.gender = gender;
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (isActive !== null) where.isActive = isActive === "true";

    // Fetch patients and total count
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              appointments: true,
              emrRecords: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return paginatedResponse(patients, page, limit, total);
  } catch (error) {
    console.error("Get patients error:", error);
    
return errorResponse("Failed to fetch patients", 500);
  }
}

  // POST /api/patients - Create a new patient
  export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const validation = await validateRequest(request, createPatientSchema);

    if ("error" in validation) return validation.error;

    const data = validation.data;

    // Check duplicate CNIC
    if (data.cnic) {
      const existingPatient = await prisma.patient.findUnique({
        where: { cnic: data.cnic },
      });

      if (existingPatient) {
        return errorResponse("Patient with this CNIC already exists", 409);
      }
    }

    const patientNumber = generatePatientNumber();
    console.log(data,"ds")

    const patient = await prisma.patient.create({
      data: {
        patientNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        cnic: data.cnic,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        address: data.address,
        city: data.city,
        photo: data.photo,
        bloodGroup: data.bloodGroup as BloodGroup,
        allergies: data.allergies,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
        emergencyRelation: data.emergencyRelation,
        notes: data.notes,
        userId: user.id,
      },
    });

    console.log(data)
    await logActivity(
      user.id,
      "CREATE",
      "patients",
      patient.id,
      "Patient",
      null,
      patient
    );

    return successResponse(patient, 201);
  } catch (error) {
    console.error("Create patient error:", error);
    
return errorResponse("Failed to create patient", 500);
  }
}
