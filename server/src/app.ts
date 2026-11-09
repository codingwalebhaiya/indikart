import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ message: "Server is running!", uptime: process.uptime() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
