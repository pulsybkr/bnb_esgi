/**
 * Client HTTP Axios configuré pour l'authentification par cookies
 */

import axios, { AxiosInstance } from 'axios'

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Créer l'instance Axios
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
    // IMPORTANT: Permet d'envoyer et recevoir les cookies de session
    withCredentials: true
})

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        // Si l'erreur est 401, l'utilisateur n'est pas authentifié
        if (error.response?.status === 401) {
            // Rediriger vers la page de connexion si nécessaire
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // Optionnel: rediriger automatiquement vers login
                // window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
