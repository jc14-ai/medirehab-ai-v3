import { Request, Response } from "express";
import {
    createDoctorUser,
    createPatientUser
} from "../services/user.service";
import { HttpError } from "../utils/httpError";
import {
    validateCreateDoctorInput,
    validateCreatePatientInput
} from "../utils/userValidation";

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
        const input = validateCreateDoctorInput(req.body);
        const doctor = await createDoctorUser(input);

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

        const input = validateCreatePatientInput(req.body);
        const patient = await createPatientUser(
            input,
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
