export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: AuthUser;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
