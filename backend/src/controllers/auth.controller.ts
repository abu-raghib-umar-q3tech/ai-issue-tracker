import type { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service.js';
import type {
  LoginRequestBody,
  LoginResponse,
  RegisterRequestBody,
  RegisterResponse
} from '../types/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const registerHandler = asyncHandler(
  async (req: Request<{}, RegisterResponse, RegisterRequestBody>, res: Response<RegisterResponse>): Promise<void> => {
    const response = await registerUser(req.body);
    res.status(201).json(response);
  }
);

const loginHandler = asyncHandler(
  async (req: Request<{}, LoginResponse, LoginRequestBody>, res: Response<LoginResponse>): Promise<void> => {
    const response = await loginUser(req.body);
    res.status(200).json(response);
  }
);

export { loginHandler, registerHandler };
