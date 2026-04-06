import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary, RequestHandler } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

type AsyncRequestHandler<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = ParsedQs> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler = <P = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = ParsedQs>(
  fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { asyncHandler };
