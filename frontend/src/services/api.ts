import axios, { type AxiosInstance, type AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'

// Créer une instance axios avec la configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour les cookies d'authentification
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage ou cookies
    const token = localStorage.getItem('accessToken') || document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Erreur de réponse du serveur
      const data = error.response.data as any
      const message = data?.message || 'Une erreur est survenue'
      console.error('API Error:', message)
      
      // Gérer les erreurs d'authentification
      if (error.response.status === 401) {
        // Rediriger vers la page de connexion ou rafraîchir le token
        localStorage.removeItem('accessToken')
        // Ne pas rediriger automatiquement pour éviter les boucles
        // window.location.href = '/auth/login'
      }
      
      // Gérer les erreurs de base de données (503)
      if (error.response.status === 503 && data?.type === 'database_error') {
        console.error('⚠️ Erreur de base de données:', message)
        // Le message sera affiché dans l'interface utilisateur
      }
    } else if (error.request) {
      // Erreur de requête (pas de réponse)
      console.error('Network Error: Le serveur backend ne répond pas. Vérifiez qu\'il est démarré sur http://localhost:3333')
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

