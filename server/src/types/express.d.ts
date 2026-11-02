type UserRole = "USER" | "ADMIN";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
        role: UserRole;
      };
    }
  }
}

export {};
