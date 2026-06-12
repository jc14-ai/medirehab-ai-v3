import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const AUTH_COOKIE_NAME = "authToken";

type AuthTokenPayload = {
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

const getTokenFromRequest = (req: Request): string | undefined => {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];

    if (cookieToken) {
        return cookieToken;
    }

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice("Bearer ".length);
    }

    return undefined;
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
            return;
        }

        const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};
