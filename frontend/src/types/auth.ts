/**
 * Types pour l'authentification (synchronisés avec le backend)
 */

export interface UserPayload {
    id: string
    email: string
    firstName: string
    lastName: string
    userType: 'locataire' | 'proprietaire' | 'admin'
    emailVerified: boolean
}

export interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
    userType: 'locataire' | 'proprietaire' | 'admin'
}

export interface LoginData {
    email: string
    password: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface AuthResponse {
    user: UserPayload
    tokens: AuthTokens
}

export interface RefreshTokenData {
    refreshToken: string
}

export interface PasswordResetData {
    email: string
}

export interface ResetPasswordData {
    token: string
    newPassword: string
}

export interface ChangePasswordData {
    currentPassword: string
    newPassword: string
}

export interface UpdateProfileData {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    profilePhoto?: string
    preferences?: any
}

export type UserType = 'locataire' | 'proprietaire' | 'admin'

export enum PermissionLevel {
    PUBLIC = 0,
    TENANT = 1,
    OWNER = 2,
    ADMIN = 3
}
