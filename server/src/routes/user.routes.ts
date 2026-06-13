import { Router } from "express";
import { Role } from "@prisma/client";
import {
    createDoctor,
    createPatient,
    meProfile
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/me/profile", authMiddleware, meProfile);
router.post("/doctors", authMiddleware, requireRole(Role.ADMIN), createDoctor);
router.post("/patients", authMiddleware, requireRole(Role.DOCTOR), createPatient);

export default router;
