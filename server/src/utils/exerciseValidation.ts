import {
    ensureAtLeastOneDefined,
    optionalString,
    requireString
} from "./validation";
import { HttpError } from "./httpError";

export type ValidatedExerciseImageInput = {
    imageName: string;
    filepath: string;
};

export type ValidatedCreateExerciseInput = {
    name: string;
    description: string;
    images: ValidatedExerciseImageInput[];
};

export type ValidatedUpdateExerciseInput = {
    name?: string | undefined;
    description?: string | undefined;
    images?: ValidatedExerciseImageInput[] | undefined;
};

export type ValidatedAssignExerciseInput = {
    exerciseId: string;
};

const validateImages = (value: unknown): ValidatedExerciseImageInput[] => {
    if (value === undefined || value === null) {
        return [];
    }

    if (!Array.isArray(value)) {
        throw new HttpError(400, "Images must be an array.");
    }

    return value.map((image, index) => {
        if (!image || typeof image !== "object") {
            throw new HttpError(400, `Image ${index + 1} is invalid.`);
        }

        const imageBody = image as Record<string, unknown>;

        return {
            imageName: requireString(imageBody.imageName, `Image ${index + 1} name`),
            filepath: requireString(imageBody.filepath, `Image ${index + 1} filepath`)
        };
    });
};

export const validateCreateExerciseInput = (
    body: Record<string, unknown>
): ValidatedCreateExerciseInput => ({
    name: requireString(body.name ?? body.exercise, "Exercise name"),
    description: requireString(body.description, "Description"),
    images: validateImages(body.images)
});

export const validateUpdateExerciseInput = (
    body: Record<string, unknown>
): ValidatedUpdateExerciseInput => {
    const hasImages = body.images !== undefined;
    const input = {
        name: optionalString(body.name ?? body.exercise, "Exercise name"),
        description: optionalString(body.description, "Description"),
        images: hasImages ? validateImages(body.images) : undefined
    };

    ensureAtLeastOneDefined(input);
    return input;
};

export const validateAssignExerciseInput = (
    body: Record<string, unknown>
): ValidatedAssignExerciseInput => ({
    exerciseId: requireString(body.exerciseId, "Exercise id")
});

export const validateExerciseIdParam = (value: unknown): string => {
    return requireString(value, "Exercise id");
};

export const validateAssignmentIdParam = (value: unknown): string => {
    return requireString(value, "Assignment id");
};
