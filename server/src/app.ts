import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.routes.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

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

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Express backend!" });
});

app.use("/api/v1/auth", authRouter);
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.json({ message: "Server is running!", uptime: process.uptime() });
});

// not found
app.use(notFound);

// global error handler
app.use(errorHandler);

export default app;
