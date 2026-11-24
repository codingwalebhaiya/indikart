import type { Request, Response, NextFunction } from "express";

// Generic RequestHandler jo koi bhi Params, Body, Query accept kar lega
type RequestHandlerAsync<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

const asyncHandler =
  <P, ResBody, ReqBody, ReqQuery>(
    requestHandler: RequestHandlerAsync<P, ResBody, ReqBody, ReqQuery>,
  ) =>
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction,
  ): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };

export default asyncHandler;
