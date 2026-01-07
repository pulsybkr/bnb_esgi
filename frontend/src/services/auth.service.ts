import apiClient from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  userType: 'locataire' | 'proprietaire'
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      userType: string
      emailVerified: boolean
    }
    accessToken: string
    refreshToken: string
  }
}

export const authService = {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Nettoyer le localStorage avant de se connecter pour éviter les problèmes
    try {
      localStorage.removeItem('bnb-auth')
    } catch (e) {
      // Ignorer les erreurs
    }
    
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      return response.data
    } catch (error: any) {
      // Si erreur "already authenticated", appeler logout d'abord puis réessayer
      if (error.response?.data?.type === 'already_authenticated' || 
          error.response?.data?.message?.includes('already authenticated')) {
        try {
          // Essayer de se déconnecter d'abord (peut échouer si pas vraiment authentifié)
          await this.logout()
        } catch (logoutError) {
          // Ignorer les erreurs de logout
        }
        // Réessayer la connexion
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
        return response.data
      }
      throw error
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>('/auth/refresh', { refreshToken })
    return response.data.data
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      // Appeler l'API de déconnexion pour invalider le refresh token côté serveur
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Même si l'API échoue, on continue la déconnexion côté client
      console.error('Erreur lors de la déconnexion:', error)
    }
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<any> {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   */
  async updateProfile(data: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    profilePhoto?: string
    preferences?: any
  }): Promise<any> {
    const response = await apiClient.put('/auth/profile', data)
    return response.data
  }
}

