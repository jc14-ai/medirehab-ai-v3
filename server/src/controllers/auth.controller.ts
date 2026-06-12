import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const AUTH_COOKIE_NAME = "authToken";

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return secret;
};

const toSafeUser = (user: {
    id: string;
    email: string;
    role: string;
}) => ({
    id: user.id,
    email: user.email,
    role: user.role
});

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
            return;
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            getJwtSecret(),
            { expiresIn: "7d" }
        );

        res.cookie(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successful.",
            user: toSafeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to login."
        });
    }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful."
    });
};

export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found."
            });
            return;
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load user."
        });
    }
};
