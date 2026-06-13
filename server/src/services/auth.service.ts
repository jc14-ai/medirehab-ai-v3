import { prisma } from "../lib/prisma";
import { signAuthToken } from "../utils/jwt";
import { comparePassword } from "../utils/password";

type SafeUser = {
    id: string;
    email: string;
    role: string;
};

export class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid email or password.");
        this.name = "InvalidCredentialsError";
    }
}

const toSafeUser = (user: SafeUser): SafeUser => ({
    id: user.id,
    email: user.email,
    role: user.role
});

export const loginUser = async (
    email: string,
    password: string
): Promise<{ token: string; user: SafeUser }> => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new InvalidCredentialsError();
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    const token = signAuthToken({
        userId: user.id,
        role: user.role
    });

    return {
        token,
        user: toSafeUser(user)
    };
};

export const getCurrentUser = async (userId: string): Promise<SafeUser | null> => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true
        }
    });
};
