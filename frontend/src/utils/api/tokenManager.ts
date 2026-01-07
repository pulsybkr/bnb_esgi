/**
 * Gestionnaire de tokens JWT
 */

const ACCESS_TOKEN_KEY = 'bnb_access_token'
const REFRESH_TOKEN_KEY = 'bnb_refresh_token'

export class TokenManager {
    /**
     * Sauvegarder les tokens
     */
    static saveTokens(accessToken: string, refreshToken: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        }
    }

    /**
     * Récupérer l'access token
     */
    static getAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(ACCESS_TOKEN_KEY)
        }
        return null
    }

    /**
     * Récupérer le refresh token
     */
    static getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(REFRESH_TOKEN_KEY)
        }
        return null
    }

    /**
     * Supprimer les tokens
     */
    static clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ACCESS_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
    }

    /**
     * Vérifier si un token existe
     */
    static hasToken(): boolean {
        return !!this.getAccessToken()
    }

    /**
     * Décoder un JWT (sans vérification de signature)
     */
    static decodeToken(token: string): any {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
            return JSON.parse(jsonPayload)
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error)
            return null
        }
    }

    /**
     * Vérifier si le token est expiré
     */
    static isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token)
        if (!decoded || !decoded.exp) {
            return true
        }
        const currentTime = Date.now() / 1000
        return decoded.exp < currentTime
    }

    /**
     * Vérifier si le token va expirer bientôt (dans les 5 minutes)
     */
    static isTokenExpiringSoon(token: string): boolean {
        const decoded = this.decodeToken(token)
        if (!decoded || !decoded.exp) {
            return true
        }
        const currentTime = Date.now() / 1000
        const fiveMinutes = 5 * 60
        return decoded.exp - currentTime < fiveMinutes
    }
}
