import type { NextFunction, Request, Response } from 'express';
import type { AppError } from '../types/http.js';

const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export { notFound };
