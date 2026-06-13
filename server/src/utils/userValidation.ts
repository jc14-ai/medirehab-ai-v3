import {
    ensureAtLeastOneDefined,
    optionalDateString,
    optionalString,
    requireString,
    validateBoolean,
    validateEmail,
    validatePassword
} from "./validation";

export type ValidatedCreateDoctorInput = {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    specialization?: string | undefined;
    licenseNumber?: string | undefined;
    contactNumber?: string | undefined;
    clinicSchedule?: string | undefined;
};

export type ValidatedCreatePatientInput = {
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    birthDate?: string | undefined;
    gender?: string | undefined;
    contactNumber?: string | undefined;
    address?: string | undefined;
    medicalCondition?: string | undefined;
};

export type ValidatedUpdateDoctorInput = {
    firstName?: string | undefined;
    lastName?: string | undefined;
    specialization?: string | undefined;
    licenseNumber?: string | undefined;
    contactNumber?: string | undefined;
    clinicSchedule?: string | undefined;
};

export type ValidatedUpdatePatientInput = {
    firstName?: string | undefined;
    lastName?: string | undefined;
    birthDate?: string | undefined;
    gender?: string | undefined;
    contactNumber?: string | undefined;
    address?: string | undefined;
    medicalCondition?: string | undefined;
};

export type ValidatedChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
};

export type ValidatedResetPasswordInput = {
    password: string;
};

export type ValidatedAccountStatusInput = {
    isActive: boolean;
};

export type ValidatedAssignDoctorInput = {
    doctorUserId: string;
};

export const validateCreateDoctorInput = (
    body: Record<string, unknown>
): ValidatedCreateDoctorInput => ({
    email: validateEmail(body.email),
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
    firstName: optionalString(body.firstName, "First name"),
    lastName: optionalString(body.lastName, "Last name"),
    birthDate: optionalDateString(body.birthDate, "Birth date"),
    gender: optionalString(body.gender, "Gender"),
    contactNumber: optionalString(body.contactNumber, "Contact number"),
    address: optionalString(body.address, "Address"),
    medicalCondition: optionalString(body.medicalCondition, "Medical condition")
});

export const validateUserIdParam = (value: unknown): string => {
    return requireString(value, "User id");
};

export const validateUpdateDoctorInput = (
    body: Record<string, unknown>
): ValidatedUpdateDoctorInput => {
    const input = {
        firstName: optionalString(body.firstName, "First name"),
        lastName: optionalString(body.lastName, "Last name"),
        specialization: optionalString(body.specialization, "Specialization"),
        licenseNumber: optionalString(body.licenseNumber, "License number"),
        contactNumber: optionalString(body.contactNumber, "Contact number"),
        clinicSchedule: optionalString(body.clinicSchedule, "Clinic schedule")
    };

    ensureAtLeastOneDefined(input);
    return input;
};

export const validateUpdatePatientInput = (
    body: Record<string, unknown>
): ValidatedUpdatePatientInput => {
    const input = {
        firstName: optionalString(body.firstName, "First name"),
        lastName: optionalString(body.lastName, "Last name"),
        birthDate: optionalDateString(body.birthDate, "Birth date"),
        gender: optionalString(body.gender, "Gender"),
        contactNumber: optionalString(body.contactNumber, "Contact number"),
        address: optionalString(body.address, "Address"),
        medicalCondition: optionalString(body.medicalCondition, "Medical condition")
    };

    ensureAtLeastOneDefined(input);
    return input;
};

export const validateChangePasswordInput = (
    body: Record<string, unknown>
): ValidatedChangePasswordInput => ({
    currentPassword: requireString(body.currentPassword, "Current password"),
    newPassword: validatePassword(body.newPassword)
});

export const validateResetPasswordInput = (
    body: Record<string, unknown>
): ValidatedResetPasswordInput => ({
    password: validatePassword(body.password ?? body.newPassword)
});

export const validateAccountStatusInput = (
    body: Record<string, unknown>
): ValidatedAccountStatusInput => ({
    isActive: validateBoolean(body.isActive, "isActive")
});

export const validateAssignDoctorInput = (
    body: Record<string, unknown>
): ValidatedAssignDoctorInput => ({
    doctorUserId: validateUserIdParam(body.doctorUserId)
});
