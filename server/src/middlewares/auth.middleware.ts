import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
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

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                role: true,
                isActive: true,
                archivedAt: true,
                mustChangePassword: true
            }
        });

        if (!user || !user.isActive || user.archivedAt) {
            res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
            return;
        }

            req.user = {
                userId: user.id,
                role: user.role,
                mustChangePassword: user.mustChangePassword
            };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};
