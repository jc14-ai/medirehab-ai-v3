import { Request, Response, Router } from "express";
import careRoutes from "./care.routes";
import authRoutes from "./auth.routes";
import exerciseRoutes from "./exercise.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/init", (req:Request, res: Response) => {
    return res.status(200).json({success: true, message: "Express is running."});
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/care", careRoutes);

export default router;
