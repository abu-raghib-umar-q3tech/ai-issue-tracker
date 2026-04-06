import type { UserRole } from '../models/user.model.js';

interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RegisterResponse {
  user: AuthUser;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type {
  AuthTokenPayload,
  AuthUser,
  LoginRequestBody,
  LoginResponse,
  RegisterRequestBody,
  RegisterResponse
};
