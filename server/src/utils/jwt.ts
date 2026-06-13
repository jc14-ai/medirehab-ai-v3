import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
    userId: string;
    role: string;
};

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return secret;
};

export const signAuthToken = (payload: AuthTokenPayload): string => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
};
