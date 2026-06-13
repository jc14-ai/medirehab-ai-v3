import crypto from "crypto";

const TEMPORARY_PASSWORD_LENGTH = 14;
const TEMPORARY_PASSWORD_ALPHABET =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export const generateTemporaryPassword = (): string => {
    let password = "";

    for (let index = 0; index < TEMPORARY_PASSWORD_LENGTH; index += 1) {
        const randomIndex = crypto.randomInt(TEMPORARY_PASSWORD_ALPHABET.length);
        password += TEMPORARY_PASSWORD_ALPHABET.charAt(randomIndex);
    }

    return password;
};
