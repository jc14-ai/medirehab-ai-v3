import { HttpError } from "./httpError";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export const requireString = (
    value: unknown,
    fieldName: string
): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new HttpError(400, `${fieldName} is required.`);
    }

    return value.trim();
};

export const optionalString = (
    value: unknown,
    fieldName: string
): string | undefined => {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== "string") {
        throw new HttpError(400, `${fieldName} must be a string.`);
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const validateEmail = (value: unknown): string => {
    const email = requireString(value, "Email").toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
        throw new HttpError(400, "Email is invalid.");
    }

    return email;
};

export const validatePassword = (value: unknown): string => {
    const password = requireString(value, "Password");

    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new HttpError(
            400,
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
        );
    }

    return password;
};

export const optionalDateString = (
    value: unknown,
    fieldName: string
): string | undefined => {
    const dateValue = optionalString(value, fieldName);

    if (!dateValue) {
        return undefined;
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new HttpError(400, `${fieldName} is invalid.`);
    }

    return dateValue;
};
