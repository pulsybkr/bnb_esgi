import axios, { type AxiosInstance, type AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'

// Créer une instance axios avec la configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Ne pas définir Content-Type par défaut ici pour permettre à axios
  // de le définir automatiquement selon le type de données (JSON ou FormData)
  withCredentials: true, // Pour les cookies d'authentification
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
      // Ne pas envoyer le token pour les routes de login/register
      // pour éviter le message "already authenticated" et permettre la reconnexion
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        // Supprimer explicitement le header Authorization si présent
        delete config.headers.Authorization
        // Ne pas lire depuis localStorage pour ces routes
        return config
      }

    // Ne pas ajouter le token si la requête est marquée pour skip (après refresh)
    if ((config as any)._skipAuthInterceptor) {
      return config
    }

    // Récupérer le token depuis localStorage (sauvegardé par pinia-plugin-persistedstate)
    // Le store Pinia sauvegarde les tokens dans localStorage avec la clé 'bnb-auth'
    try {
      const authData = localStorage.getItem('bnb-auth')
      if (authData) {
        const parsed = JSON.parse(authData)
        // Essayer différents formats de stockage
        const token = parsed?.state?.accessToken || parsed?.accessToken || parsed?.accessToken?.value
        if (token) {
          // Toujours ajouter le token, même pour FormData
          // Axios gérera correctement les headers pour FormData
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('Token non trouvé dans localStorage pour la requête:', config.url)
        }
      } else {
        console.warn('Aucune donnée d\'authentification dans localStorage pour la requête:', config.url)
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du token:', e)
    }
    
    // Pour FormData, s'assurer que Content-Type n'est pas défini explicitement
    // pour laisser axios le définir avec la boundary correcte
    if (config.data instanceof FormData) {
      // Supprimer Content-Type si défini dans headers pour laisser axios le gérer
      if (config.headers['Content-Type']) {
        delete config.headers['Content-Type']
      }
      // Supprimer aussi dans le header par défaut si présent
      if (config.headers.common && config.headers.common['Content-Type']) {
        delete config.headers.common['Content-Type']
      }
      // Supprimer le Content-Type par défaut de l'instance axios
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Variable pour éviter les boucles infinies de refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Intercepteur pour gérer les erreurs et rafraîchir le token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response) {
      // Erreur de réponse du serveur
      const data = error.response.data as any
      const message = data?.message || 'Une erreur est survenue'
      
      // Gérer les erreurs d'authentification (401)
      if (error.response.status === 401 && !originalRequest._retry) {
        // Si c'est une erreur de token expiré/invalide et qu'on n'a pas déjà tenté de rafraîchir
        // Accepter plusieurs variantes du message d'erreur
        const isTokenError = message.includes('expired') || 
                            message.includes('invalid token') || 
                            message.includes('Access token') ||
                            message.includes('Token') ||
                            message.toLowerCase().includes('token')
        
        if (isTokenError) {
          console.log('Token expiré/invalide détecté, tentative de rafraîchissement...')
          if (isRefreshing) {
            // Si un rafraîchissement est déjà en cours, attendre dans la queue
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return apiClient(originalRequest)
              })
              .catch(err => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            // Récupérer le refresh token
            const authData = localStorage.getItem('bnb-auth')
            if (!authData) {
              throw new Error('No refresh token available')
            }

            const parsed = JSON.parse(authData)
            const refreshToken = parsed?.state?.refreshToken || parsed?.refreshToken

            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            // Appeler directement l'API de refresh sans utiliser apiClient pour éviter les intercepteurs
            // Utiliser axios directement pour éviter les problèmes de circular dependencies
            const axiosInstance = axios.create({
              baseURL: API_BASE_URL,
              withCredentials: true, // Important pour envoyer et recevoir les cookies
            })
            
            // Appeler le endpoint de refresh
            const refreshResponse = await axiosInstance.post('/auth/refresh', { refreshToken })
            
            // Le backend renvoie maintenant les nouveaux tokens dans la réponse JSON
            // ET dans les cookies HTTP-only
            const newAccessToken = refreshResponse.data?.data?.accessToken
            const newRefreshToken = refreshResponse.data?.data?.refreshToken
            
            if (newAccessToken) {
              // Mettre à jour le localStorage avec les nouveaux tokens
              if (parsed?.state) {
                parsed.state.accessToken = newAccessToken
                if (newRefreshToken) {
                  parsed.state.refreshToken = newRefreshToken
                }
              } else {
                parsed.accessToken = newAccessToken
                if (newRefreshToken) {
                  parsed.refreshToken = newRefreshToken
                }
              }
              localStorage.setItem('bnb-auth', JSON.stringify(parsed))
              
              // Mettre à jour le store Pinia
              const authStoreModule = await import('@/stores/auth')
              const authStore = authStoreModule.useAuthStore()
              authStore.setTokens(newAccessToken, newRefreshToken || refreshToken)
              
              // Mettre à jour le header de la requête originale avec le nouveau token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              
              // Retenter la requête originale avec le nouveau token
              const retryResponse = await apiClient(originalRequest)
              
              // Traiter la queue avec le nouveau token
              processQueue(null, newAccessToken)
              
              return retryResponse
            } else {
              // Si les tokens ne sont pas dans la réponse, utiliser les cookies
              // Marquer la requête pour ne pas ré-ajouter l'ancien token expiré
              originalRequest._skipAuthInterceptor = true
              
              // Supprimer le header Authorization pour utiliser les cookies
              delete originalRequest.headers.Authorization
              
              // Retenter la requête originale (les cookies HTTP-only seront utilisés)
              const retryResponse = await axiosInstance(originalRequest)
              
              // Traiter la queue
              processQueue(null, null)
              
              return retryResponse
            }
          } catch (refreshError) {
            // Si le rafraîchissement échoue, nettoyer et rejeter
            processQueue(refreshError, null)
            
            // Nettoyer les tokens
            try {
              const authData = localStorage.getItem('bnb-auth')
              if (authData) {
                const parsed = JSON.parse(authData)
                if (parsed?.state) {
                  parsed.state.accessToken = null
                  parsed.state.refreshToken = null
                  parsed.state.user = null
                  localStorage.setItem('bnb-auth', JSON.stringify(parsed))
                }
              }
              
              // Nettoyer le store Pinia
              const authStoreModule = await import('@/stores/auth')
              const authStore = authStoreModule.useAuthStore()
              authStore.clearAuth()
            } catch (e) {
              // Ignorer les erreurs
            }
            
            // Rediriger vers la page de login
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          // Autre type d'erreur 401 (token manquant, etc.)
          console.error('API Error:', message)
          
          // Nettoyer les tokens
          try {
            const authData = localStorage.getItem('bnb-auth')
            if (authData) {
              const parsed = JSON.parse(authData)
              if (parsed?.state) {
                parsed.state.accessToken = null
                parsed.state.refreshToken = null
                parsed.state.user = null
                localStorage.setItem('bnb-auth', JSON.stringify(parsed))
              }
            }
            
            // Nettoyer le store Pinia
            const authStoreModule = await import('@/stores/auth')
            const authStore = authStoreModule.useAuthStore()
            authStore.clearAuth()
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      } else {
        console.error('API Error:', message)
      }
      
      // Gérer les erreurs de base de données (503)
      if (error.response.status === 503 && data?.type === 'database_error') {
        console.error('Erreur de base de données:', message)
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

