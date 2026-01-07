import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// Créer une instance Axios
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Pour les cookies
})

// Intercepteur de requête : ajouter le token
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Intercepteur de réponse : gérer les erreurs
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const authStore = useAuthStore()

        // Si erreur 401 et qu'on a un refresh token
        if (error.response?.status === 401 && authStore.refreshToken) {
            try {
                // Tenter de rafraîchir le token
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken: authStore.refreshToken },
                    { withCredentials: true }
                )

                const { accessToken, refreshToken } = response.data.data
                authStore.setTokens(accessToken, refreshToken)

                // Réessayer la requête originale
                if (error.config) {
                    error.config.headers.Authorization = `Bearer ${accessToken}`
                    return axios.request(error.config)
                }
            } catch (refreshError) {
                // Si le refresh échoue, déconnecter l'utilisateur
                authStore.clearAuth()
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
