import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import {
    ValidatedAssignExerciseInput,
    ValidatedCreateExerciseInput,
    ValidatedUpdateExerciseInput
} from "../utils/exerciseValidation";

const exerciseSelect = {
    id: true,
    name: true,
    description: true,
    isActive: true,
    archivedAt: true,
    images: {
        select: {
            id: true,
            imageName: true,
            filepath: true
        }
    },
    createdAt: true,
    updatedAt: true
} satisfies Prisma.ExerciseSelect;

const assignmentSelect = {
    id: true,
    assignedAt: true,
    archivedAt: true,
    exercise: {
        select: exerciseSelect
    },
    result: {
        select: {
            id: true,
            score: true
        }
    }
} satisfies Prisma.ExerciseAssignmentSelect;

const getDoctorProfileIdForUser = async (doctorUserId: string): Promise<string> => {
    const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: doctorUserId },
        select: { id: true }
    });

    if (!doctorProfile) {
        throw new HttpError(403, "Only doctors with a profile can manage exercises.");
    }

    return doctorProfile.id;
};

const getAssignedPatientProfileId = async (
    patientUserId: string,
    doctorUserId: string
): Promise<string> => {
    const doctorProfileId = await getDoctorProfileIdForUser(doctorUserId);

    const patientProfile = await prisma.patientProfile.findFirst({
        where: {
            userId: patientUserId,
            assignedDoctorId: doctorProfileId
        },
        select: { id: true }
    });

    if (!patientProfile) {
        throw new HttpError(404, "Patient not found.");
    }

    return patientProfile.id;
};

const getPatientProfileIdForUser = async (patientUserId: string): Promise<string> => {
    const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: patientUserId },
        select: { id: true }
    });

    if (!patientProfile) {
        throw new HttpError(404, "Patient profile not found.");
    }

    return patientProfile.id;
};

const ensureActiveExercise = async (exerciseId: string): Promise<void> => {
    const exercise = await prisma.exercise.findFirst({
        where: {
            id: exerciseId,
            isActive: true,
            archivedAt: null
        },
        select: { id: true }
    });

    if (!exercise) {
        throw new HttpError(404, "Exercise not found.");
    }
};

const toImageCreateMany = (input: ValidatedCreateExerciseInput | ValidatedUpdateExerciseInput) => {
    return input.images?.map((image) => ({
        imageName: image.imageName,
        filepath: image.filepath
    })) ?? [];
};

export const createExercise = async (input: ValidatedCreateExerciseInput) => {
    return prisma.exercise.create({
        data: {
            name: input.name,
            description: input.description,
            images: {
                create: toImageCreateMany(input)
            }
        },
        select: exerciseSelect
    });
};

export const listExercises = async () => {
    return prisma.exercise.findMany({
        where: {
            isActive: true,
            archivedAt: null
        },
        select: exerciseSelect,
        orderBy: { name: "asc" }
    });
};

export const updateExercise = async (
    exerciseId: string,
    input: ValidatedUpdateExerciseInput
) => {
    await ensureActiveExercise(exerciseId);

    return prisma.$transaction(async (tx) => {
        if (input.images !== undefined) {
            await tx.exerciseImage.deleteMany({
                where: { exerciseId }
            });
        }

        return tx.exercise.update({
            where: { id: exerciseId },
            data: {
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.description !== undefined ? { description: input.description } : {}),
                ...(input.images !== undefined
                    ? { images: { create: toImageCreateMany(input) } }
                    : {})
            },
            select: exerciseSelect
        });
    });
};

export const archiveExercise = async (exerciseId: string) => {
    await ensureActiveExercise(exerciseId);

    return prisma.exercise.update({
        where: { id: exerciseId },
        data: {
            isActive: false,
            archivedAt: new Date()
        },
        select: exerciseSelect
    });
};

export const listAvailableExercisesForPatient = async (
    patientUserId: string,
    doctorUserId: string
) => {
    const patientProfileId = await getAssignedPatientProfileId(
        patientUserId,
        doctorUserId
    );

    const activeAssignments = await prisma.exerciseAssignment.findMany({
        where: {
            patientProfileId,
            archivedAt: null
        },
        select: { exerciseId: true }
    });

    return prisma.exercise.findMany({
        where: {
            isActive: true,
            archivedAt: null,
            id: {
                notIn: activeAssignments.map((assignment) => assignment.exerciseId)
            }
        },
        select: exerciseSelect,
        orderBy: { name: "asc" }
    });
};

export const listAssignedExercisesForDoctorPatient = async (
    patientUserId: string,
    doctorUserId: string
) => {
    const patientProfileId = await getAssignedPatientProfileId(
        patientUserId,
        doctorUserId
    );

    return prisma.exerciseAssignment.findMany({
        where: {
            patientProfileId,
            archivedAt: null
        },
        select: assignmentSelect,
        orderBy: { assignedAt: "desc" }
    });
};

export const listAssignedExercisesForPatient = async (patientUserId: string) => {
    const patientProfileId = await getPatientProfileIdForUser(patientUserId);

    return prisma.exerciseAssignment.findMany({
        where: {
            patientProfileId,
            archivedAt: null
        },
        select: assignmentSelect,
        orderBy: { assignedAt: "desc" }
    });
};

export const assignExerciseToPatient = async (
    patientUserId: string,
    doctorUserId: string,
    input: ValidatedAssignExerciseInput
) => {
    await ensureActiveExercise(input.exerciseId);
    const patientProfileId = await getAssignedPatientProfileId(
        patientUserId,
        doctorUserId
    );
    const doctorProfileId = await getDoctorProfileIdForUser(doctorUserId);

    const existingAssignment = await prisma.exerciseAssignment.findUnique({
        where: {
            exerciseId_patientProfileId: {
                exerciseId: input.exerciseId,
                patientProfileId
            }
        },
        select: {
            id: true,
            archivedAt: true
        }
    });

    if (existingAssignment?.archivedAt === null) {
        throw new HttpError(409, "Exercise is already assigned to this patient.");
    }

    if (existingAssignment) {
        return prisma.exerciseAssignment.update({
            where: { id: existingAssignment.id },
            data: {
                archivedAt: null,
                assignedAt: new Date(),
                assignedByDoctorId: doctorProfileId,
                result: {
                    upsert: {
                        create: { score: 0 },
                        update: { score: 0 }
                    }
                }
            },
            select: assignmentSelect
        });
    }

    return prisma.exerciseAssignment.create({
        data: {
            exerciseId: input.exerciseId,
            patientProfileId,
            assignedByDoctorId: doctorProfileId,
            result: {
                create: { score: 0 }
            }
        },
        select: assignmentSelect
    });
};

export const archivePatientExerciseAssignment = async (
    patientUserId: string,
    doctorUserId: string,
    assignmentId: string
) => {
    const patientProfileId = await getAssignedPatientProfileId(
        patientUserId,
        doctorUserId
    );

    const assignment = await prisma.exerciseAssignment.findFirst({
        where: {
            id: assignmentId,
            patientProfileId,
            archivedAt: null
        },
        select: { id: true }
    });

    if (!assignment) {
        throw new HttpError(404, "Assigned exercise not found.");
    }

    return prisma.exerciseAssignment.update({
        where: { id: assignment.id },
        data: { archivedAt: new Date() },
        select: assignmentSelect
    });
};

export const evaluateExercise = async (
    patientUserId: string,
    exerciseId: string,
    assignmentId: string,
    videoBuffer: Buffer
) => {
    const uint8Array = new Uint8Array(videoBuffer);

    const formData = new FormData();
    formData.append(
        "video",
        new Blob([uint8Array], { type: "video/webm" }),
        "exercise.webm"
    );

    const res = await fetch(
        `http://127.0.0.1:8000/trace/${patientUserId}/${exerciseId}`,
        {
            method: "POST",
            body: formData,
        }
    );
    const data = await res.json();
    
    let score = 0;
    let feedback: string[] = [];

    if(data.success) {
        const res = await fetch(`http://127.0.0.1:8000/evaluate/${patientUserId}/${exerciseId}`);
        const data = await res.json();

        if(!data.success) {
            throw new HttpError(500, "Failed to evaluate exercise.");
        }

        score = data.score;
        feedback = data.feedback || [];
    }

    // Find patient profile
    // const patient = await prisma.patientProfile.findUnique({
    //     where: { userId: patientUserId }
    // });

    // if (!patient) {
    //     throw new HttpError(404, "Patient profile not found.");
    // }

    // Verify the assignment belongs to this patient and exercise catalog item
    // const assignment = await prisma.exerciseAssignment.findFirst({
    //     where: {
    //         id: assignmentId,
    //         patientProfileId: patient.id,
    //         exerciseId: exerciseId
    //     }
    // });

    // if (!assignment) {
    //     throw new HttpError(404, "Assignment not found.");
    // }

    // Update or create the result
    // const result = await prisma.exerciseResult.upsert({
    //     where: { assignmentId },
    //     create: {
    //         assignmentId,
    //         score
    //     },
    //     update: {
    //         score
    //     }
    // });

    return { score, feedback };
};

