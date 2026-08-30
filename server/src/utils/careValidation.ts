import { HttpError } from "./httpError";
import { optionalString, requireString } from "./validation";

export type ValidatedCheckInInput = {
    painLevel: number;
    difficultyLevel: number;
    confidenceLevel: number;
    note?: string | undefined;
};



export type ValidatedCommentInput = {
    body: string;
};

export const validateSessionIdParam = (value: unknown): string => {
    return requireString(value, "Session id");
};

export const validateNotificationIdParam = (value: unknown): string => {
    return requireString(value, "Notification id");
};

const validateScale = (value: unknown, fieldName: string): number => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new HttpError(400, `${fieldName} must be a number.`);
    }

    if (!Number.isInteger(value) || value < 0 || value > 10) {
        throw new HttpError(400, `${fieldName} must be an integer between 0 and 10.`);
    }

    return value;
};
export const validateCheckInInput = (
    body: Record<string, unknown>
): ValidatedCheckInInput => ({
    painLevel: validateScale(body.painLevel, "Pain level"),
    difficultyLevel: validateScale(body.difficultyLevel, "Difficulty level"),
    confidenceLevel: validateScale(body.confidenceLevel, "Confidence level"),
    note: optionalString(body.note, "Note")
});

export const validateCommentInput = (
    body: Record<string, unknown>
): ValidatedCommentInput => ({
    body: requireString(body.body, "Comment")
});
