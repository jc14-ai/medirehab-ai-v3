import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@test.test";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";

const seedAdmin = async (): Promise<void> => {
    const email = process.env.SEED_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
    const hashedPassword = await hashPassword(password);
    const passwordChangedAt = new Date();

    await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
            archivedAt: null,
            mustChangePassword: false,
            passwordChangedAt
        },
        create: {
            email,
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
            mustChangePassword: false,
            passwordChangedAt
        }
    });

    console.log(`Seeded admin account: ${email}`);

    if (!process.env.SEED_ADMIN_PASSWORD) {
        console.log(`Default admin password: ${DEFAULT_ADMIN_PASSWORD}`);
    }
};

const main = async (): Promise<void> => {
    await seedAdmin();
};

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
