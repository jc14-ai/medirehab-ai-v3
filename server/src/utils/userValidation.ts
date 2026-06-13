import {
    optionalDateString,
    optionalString,
    validateEmail,
    validatePassword
} from "./validation";

export type ValidatedCreateDoctorInput = {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    specialization?: string | undefined;
    licenseNumber?: string | undefined;
    contactNumber?: string | undefined;
    clinicSchedule?: string | undefined;
};

export type ValidatedCreatePatientInput = {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    birthDate?: string | undefined;
    gender?: string | undefined;
    contactNumber?: string | undefined;
    address?: string | undefined;
    medicalCondition?: string | undefined;
};

export const validateCreateDoctorInput = (
    body: Record<string, unknown>
): ValidatedCreateDoctorInput => ({
    email: validateEmail(body.email),
    password: validatePassword(body.password),
    firstName: optionalString(body.firstName, "First name"),
    lastName: optionalString(body.lastName, "Last name"),
    specialization: optionalString(body.specialization, "Specialization"),
    licenseNumber: optionalString(body.licenseNumber, "License number"),
    contactNumber: optionalString(body.contactNumber, "Contact number"),
    clinicSchedule: optionalString(body.clinicSchedule, "Clinic schedule")
});

export const validateCreatePatientInput = (
    body: Record<string, unknown>
): ValidatedCreatePatientInput => ({
    email: validateEmail(body.email),
    password: validatePassword(body.password),
    firstName: optionalString(body.firstName, "First name"),
    lastName: optionalString(body.lastName, "Last name"),
    birthDate: optionalDateString(body.birthDate, "Birth date"),
    gender: optionalString(body.gender, "Gender"),
    contactNumber: optionalString(body.contactNumber, "Contact number"),
    address: optionalString(body.address, "Address"),
    medicalCondition: optionalString(body.medicalCondition, "Medical condition")
});
