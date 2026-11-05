import pino from "pino";
import { env } from "../../config/env.js";

export const logger = pino({
  level: env.NODE_ENV === "development" ? "info" : "debug",

  redact: {
    paths: [
      "req.headers.authorzation",
      "req.headers.cookie",
      "res.headers.set-cookie",
      "password",
      "password_hash",
      "refreshToken",
      "refreshTokenHash",
    ],
    censor: "[REDACTED]",
  },

  ...(env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  }),
});
