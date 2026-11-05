import type { Request, Response, NextFunction } from "express";

type RequestHandlerAsync = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

const asyncHandler =
  (requestHandler: RequestHandlerAsync) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };

export default asyncHandler;
