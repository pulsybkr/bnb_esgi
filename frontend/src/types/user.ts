/**
 * Types pour les utilisateurs
 */

export type UserStatus = 'actif' | 'suspendu' | 'supprime'
export type UserType = 'locataire' | 'proprietaire' | 'admin'

export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    city?: string
    country?: string
    profilePhoto?: string
    userType: UserType
    status: UserStatus
    emailVerified: boolean
    phoneVerified: boolean
    preferences?: any
    registrationDate: Date
    lastLogin?: Date
}

export interface UpdateUserData {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    profilePhoto?: string
    preferences?: any
}
