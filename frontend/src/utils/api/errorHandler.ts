/**
 * Gestionnaire centralisé des erreurs API
 */

import {
    ApiException,
    AuthenticationException,
    AuthorizationException,
    ValidationException,
    NotFoundException
} from '@/types/api'

export class ErrorHandler {
    /**
     * Convertir une erreur HTTP en exception typée
     */
    static handleError(error: any): never {
        // Erreur Axios
        if (error.response) {
            const { status, data } = error.response
            const message = data?.message || data?.error || 'Une erreur est survenue'
            const field = data?.field

            switch (status) {
                case 400:
                    throw new ValidationException(message, field)
                case 401:
                    throw new AuthenticationException(message)
                case 403:
                    throw new AuthorizationException(message)
                case 404:
                    throw new NotFoundException(message)
                default:
                    throw new ApiException(message, status)
            }
        }

        // Erreur réseau
        if (error.request) {
            throw new ApiException('Erreur de connexion au serveur', 0)
        }

        // Autre erreur
        throw new ApiException(error.message || 'Une erreur inattendue est survenue')
    }

    /**
     * Extraire le message d'erreur pour l'affichage
     */
    static getErrorMessage(error: any): string {
        if (error instanceof ApiException) {
            return error.message
        }
        if (error.response?.data?.message) {
            return error.response.data.message
        }
        if (error.message) {
            return error.message
        }
        return 'Une erreur inattendue est survenue'
    }

    /**
     * Vérifier si une erreur est une erreur d'authentification
     */
    static isAuthError(error: any): boolean {
        return (
            error instanceof AuthenticationException ||
            error.response?.status === 401
        )
    }

    /**
     * Vérifier si une erreur est une erreur de validation
     */
    static isValidationError(error: any): boolean {
        return (
            error instanceof ValidationException ||
            error.response?.status === 400
        )
    }
}
