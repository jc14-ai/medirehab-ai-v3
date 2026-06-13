import { NextFunction, Request, Response } from "express";

export const requirePasswordChanged = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Unauthorized."
        });
        return;
    }

    if (req.user.mustChangePassword) {
        res.status(403).json({
            success: false,
            message: "Password change is required before continuing."
        });
        return;
    }

    next();
};
