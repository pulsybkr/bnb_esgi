/**
 * Types génériques pour les réponses API
 */

export interface ApiResponse<T = any> {
    success: boolean
    message?: string
    data?: T
}

export interface ApiError {
    success: false
    message: string
    error?: string
    field?: string
    statusCode?: number
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ApiRequestConfig {
    headers?: Record<string, string>
    params?: Record<string, any>
}

// Types pour les erreurs personnalisées
export class ApiException extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public field?: string
    ) {
        super(message)
        this.name = 'ApiException'
    }
}

export class AuthenticationException extends ApiException {
    constructor(message: string = 'Non authentifié') {
        super(message, 401)
        this.name = 'AuthenticationException'
    }
}

export class AuthorizationException extends ApiException {
    constructor(message: string = 'Accès refusé') {
        super(message, 403)
        this.name = 'AuthorizationException'
    }
}

export class ValidationException extends ApiException {
    constructor(message: string, field?: string) {
        super(message, 400, field)
        this.name = 'ValidationException'
    }
}

export class NotFoundException extends ApiException {
    constructor(message: string = 'Ressource non trouvée') {
        super(message, 404)
        this.name = 'NotFoundException'
    }
}
