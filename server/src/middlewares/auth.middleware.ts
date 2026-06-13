import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../utils/jwt";

const AUTH_COOKIE_NAME = "authToken";

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

        const decoded = verifyAuthToken(token);
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
