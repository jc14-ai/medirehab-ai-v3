import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

export const requireRole = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role as Role)) {
            res.status(403).json({
                success: false,
                message: "Forbidden."
            });
            return;
        }

        next();
    };
};
