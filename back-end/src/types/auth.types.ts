import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'locataire' | 'proprietaire' | 'admin';
  emailVerified: boolean;
}

export interface JWTPayload extends UserPayload {
  iat?: number;
  exp?: number;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  userType: 'locataire' | 'proprietaire' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface AuthResponse {
  user: UserPayload;
  tokens: AuthTokens;
}

export interface PasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Permission levels for different user types
export enum PermissionLevel {
  PUBLIC = 0,
  TENANT = 1,
  OWNER = 2,
  ADMIN = 3,
}

// Route permissions configuration
export interface RoutePermission {
  requiredLevel: PermissionLevel;
  allowSameUser?: boolean; // Allow access if user is accessing their own data
}

// Error types
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

