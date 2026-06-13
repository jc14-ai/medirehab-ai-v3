import { Request, Response } from "express";
import {
    createDoctorUser,
    createPatientUser
} from "../services/user.service";
import { HttpError } from "../utils/httpError";

const handleCreateUserError = (
    error: unknown,
    res: Response,
    fallbackMessage: string
): void => {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: fallbackMessage
    });
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            specialization,
            licenseNumber,
            contactNumber,
            clinicSchedule
        } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
            return;
        }

        const doctor = await createDoctorUser({
            email,
            password,
            firstName,
            lastName,
            specialization,
            licenseNumber,
            contactNumber,
            clinicSchedule
        });

        res.status(201).json({
            success: true,
            message: "Doctor created successfully.",
            doctor
        });
    } catch (error) {
        handleCreateUserError(error, res, "Unable to create doctor.");
    }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
            return;
        }

        const {
            email,
            password,
            firstName,
            lastName,
            birthDate,
            gender,
            contactNumber,
            address,
            medicalCondition
        } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
            return;
        }

        const patient = await createPatientUser(
            {
                email,
                password,
                firstName,
                lastName,
                birthDate,
                gender,
                contactNumber,
                address,
                medicalCondition
            },
            req.user.userId
        );

        res.status(201).json({
            success: true,
            message: "Patient created successfully.",
            patient
        });
    } catch (error) {
        handleCreateUserError(error, res, "Unable to create patient.");
    }
};
