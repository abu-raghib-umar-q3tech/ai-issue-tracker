import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';
import type { AppError, MessageResponse } from '../types/http.js';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const appError = err as AppError;
  const statusCode = appError.statusCode ?? 500;
  const message = appError.message || 'Internal server error';

  if (env.nodeEnv !== 'production') {
    // 4xx errors (like invalid credentials) are expected client errors.
    if (statusCode >= 400 && statusCode < 500) {
      console.warn(`[${statusCode}] ${message}`);
    } else {
      console.error(appError);
    }
  }

  const payload: MessageResponse = { message };
  res.status(statusCode).json(payload);
};

export { errorHandler };
