import { Request, Response, Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/init", (req:Request, res: Response) => {
    return res.status(200).json({success: true, message: "Express is running."});
});

router.use("/auth", authRoutes);

export default router;
