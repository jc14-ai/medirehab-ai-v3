import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);

router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

export default router;
