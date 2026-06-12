import  express, { Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import initRoutes from "./routes/init.routes";

export const app = express();

app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api", initRoutes);

export default app;
