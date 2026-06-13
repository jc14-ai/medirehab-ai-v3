import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { hashPassword } from "../utils/password";

type CreateDoctorInput = {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
    licenseNumber?: string;
    contactNumber?: string;
    clinicSchedule?: string;
};

type CreatePatientInput = {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: string;
    contactNumber?: string;
    address?: string;
    medicalCondition?: string;
};

const ensureEmailAvailable = async (email: string): Promise<void> => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new HttpError(409, "Email is already in use.");
    }
};

const parseBirthDate = (birthDate?: string): Date | null => {
    if (!birthDate) {
        return null;
    }

    const parsedDate = new Date(birthDate);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new HttpError(400, "Birth date is invalid.");
    }

    return parsedDate;
};

export const createDoctorUser = async (input: CreateDoctorInput) => {
    await ensureEmailAvailable(input.email);

    const hashedPassword = await hashPassword(input.password);

    return prisma.user.create({
        data: {
            email: input.email,
            password: hashedPassword,
            role: Role.DOCTOR,
            doctorProfile: {
                create: {
                    firstName: input.firstName ?? null,
                    lastName: input.lastName ?? null,
                    specialization: input.specialization ?? null,
                    licenseNumber: input.licenseNumber ?? null,
                    contactNumber: input.contactNumber ?? null,
                    clinicSchedule: input.clinicSchedule ?? null
                }
            }
        },
        select: {
            id: true,
            email: true,
            role: true,
            doctorProfile: true
        }
    });
};

export const createPatientUser = async (
    input: CreatePatientInput,
    createdByUserId: string
) => {
    await ensureEmailAvailable(input.email);

    const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: createdByUserId },
        select: { id: true }
    });

    if (!doctorProfile) {
        throw new HttpError(403, "Only doctors with a profile can create patients.");
    }

    const hashedPassword = await hashPassword(input.password);

    return prisma.user.create({
        data: {
            email: input.email,
            password: hashedPassword,
            role: Role.PATIENT,
            patientProfile: {
                create: {
                    firstName: input.firstName ?? null,
                    lastName: input.lastName ?? null,
                    birthDate: parseBirthDate(input.birthDate),
                    gender: input.gender ?? null,
                    contactNumber: input.contactNumber ?? null,
                    address: input.address ?? null,
                    medicalCondition: input.medicalCondition ?? null,
                    assignedDoctorId: doctorProfile.id
                }
            }
        },
        select: {
            id: true,
            email: true,
            role: true,
            patientProfile: true
        }
    });
};
