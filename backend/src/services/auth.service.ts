import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, type UserDocument } from '../models/user.model.js';
import type {
  AuthTokenPayload,
  AuthUser,
  LoginRequestBody,
  LoginResponse,
  RegisterRequestBody,
  RegisterResponse
} from '../types/auth.js';
import type { AppError } from '../types/http.js';

const makeAppError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const toAuthUser = (user: UserDocument): AuthUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const signToken = (payload: AuthTokenPayload): string => {
  const signOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn']
  };

  return jwt.sign(payload as JwtPayload, env.jwtSecret, signOptions);
};

const registerUser = async (payload: RegisterRequestBody): Promise<RegisterResponse> => {
  const name = payload.name?.trim();
  const email = normalizeEmail(payload.email ?? '');
  const password = payload.password ?? '';

  if (!name || !email || !password) {
    throw makeAppError('Name, email, and password are required', 400);
  }

  if (password.length < 6) {
    throw makeAppError('Password must be at least 6 characters long', 400);
  }

  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    throw makeAppError('Email is already in use', 409);
  }

  const user = await User.create({
    name,
    email,
    password
  });

  return { user: toAuthUser(user) };
};

const loginUser = async (payload: LoginRequestBody): Promise<LoginResponse> => {
  const email = normalizeEmail(payload.email ?? '');
  const password = payload.password ?? '';

  if (!email || !password) {
    throw makeAppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw makeAppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw makeAppError('Invalid credentials', 401);
  }

  const tokenPayload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };

  const token = signToken(tokenPayload);

  return {
    token,
    user: toAuthUser(user)
  };
};

export { loginUser, registerUser };
