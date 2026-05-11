import { Request, Response, Router } from "express";

const router = Router();

router.get("/init", (req:Request, res: Response) => {
    return res.status(200).json({success: true, message: "Express is running."});
});

export default router;